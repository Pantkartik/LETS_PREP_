import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LANGUAGES, LanguageConfig } from '../../definitions/languages';
import { logger } from '../../config/logger';

export interface ExecutionConfig {
    language: string;
    code: string;
    input: string;
    timeLimit: number; // seconds
    memoryLimit: number; // MB
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    time: number; // ms
    memory: number; // MB
    error?: string;
    timeout?: boolean;
}

export class IsolationManager {
    private docker: Docker;
    private readonly WORKSPACE_ROOT = path.join(process.cwd(), 'temp', 'isolation');

    constructor() {
        this.docker = new Docker();
        this.initWorkspace();
    }

    public async checkHealth(): Promise<boolean> {
        try {
            await this.docker.ping();
            return true;
        } catch (e) {
            return false;
        }
    }

    private async initWorkspace() {
        try {
            await fs.mkdir(this.WORKSPACE_ROOT, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }
    }

    public async execute(config: ExecutionConfig): Promise<ExecutionResult> {
        const langConfig = LANGUAGES[config.language];
        if (!langConfig) throw new Error(`Unsupported language: ${config.language}`);

        const containerId = uuidv4();
        const hostDir = path.join(this.WORKSPACE_ROOT, containerId);

        let container: Docker.Container | null = null;

        try {
            // Ensure clean state
            await fs.mkdir(hostDir, { recursive: true });

            // Write code & input files
            // IMPORTANT: Write correct filename for compiled languages
            await fs.writeFile(path.join(hostDir, langConfig.sourceFile), config.code);
            await fs.writeFile(path.join(hostDir, 'input.txt'), config.input);

            // Construct Entrypoint Command
            let cmd: string[] = [];

            if (langConfig.compileCmd) {
                // Compiled Language
                const compileFn = langConfig.compileCmd as ((file: string) => string[]);
                const runFn = langConfig.runCmd as ((file: string) => string[]);

                const compileStr = compileFn(langConfig.sourceFile).join(' ');
                const runStr = runFn(langConfig.sourceFile).join(' ');

                // Chain: Compile && Run < input
                cmd = ['sh', '-c', `${compileStr} && ${runStr} < input.txt`];
            } else {
                // Interpreted Language
                const runFn = langConfig.runCmd as ((file: string) => string[]);
                const runStr = runFn(langConfig.sourceFile).join(' ');

                cmd = ['sh', '-c', `${runStr} < input.txt`];
            }

            // Create Container with Security Hardening
            const createOptions: Docker.ContainerCreateOptions = {
                Image: langConfig.image,
                WorkingDir: '/workspace',
                Cmd: cmd,
                HostConfig: {
                    Binds: [`${hostDir}:/workspace`],
                    Memory: config.memoryLimit * 1024 * 1024 * (langConfig.memoryMultiplier || 1),
                    MemorySwap: config.memoryLimit * 1024 * 1024 * (langConfig.memoryMultiplier || 1),
                    NanoCpus: 1 * 1e9, // 1 CPU
                    NetworkMode: 'none',
                    ReadonlyRootfs: false, // Start safe
                    PidsLimit: 64, // Fork bomb prevention
                    AutoRemove: false,
                    Ulimits: [
                        { Name: 'nofile', Soft: 128, Hard: 128 },
                        { Name: 'nproc', Soft: 128, Hard: 128 }
                    ],
                    CapDrop: ['ALL'], // Drop all linux capabilities
                    SecurityOpt: ['no-new-privileges'] // Prevent privilege escalation
                },
                User: 'root', // Often simpler for bind mounts
                Tty: false,
                OpenStdin: false,
                AttachStdout: true,
                AttachStderr: true
            };

            container = await this.docker.createContainer(createOptions);

            const startTime = Date.now();
            await container.start();

            // Wait with Timeout
            const maxTime = Math.ceil(config.timeLimit * 1000 * (langConfig.timeMultiplier || 1));

            let timedOut = false;
            try {
                // Wait for container to exit or timeout
                const waitPromise = container.wait();

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        timedOut = true;
                        reject(new Error('TLE'));
                    }, maxTime + 1000); // 1s buffer
                });

                await Promise.race([waitPromise, timeoutPromise]);
            } catch (e: any) {
                if (e.message === 'TLE') {
                    await container.kill().catch(() => { });
                    return {
                        stdout: '',
                        stderr: 'Time Limit Exceeded',
                        exitCode: 124,
                        time: maxTime,
                        memory: 0,
                        timeout: true,
                        error: 'Time Limit Exceeded'
                    };
                }
                throw e; // Rethrow other errors
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Inspect for exit code and OOM
            const data = await container.inspect();

            // Get Logs (Buffer)
            const logBuffer = await container.logs({ stdout: true, stderr: true });

            // Helper to Demultiplex Docker Log Buffer
            const { stdout, stderr } = this.demuxDockerLog(logBuffer as Buffer);

            if (data.State.OOMKilled) {
                return {
                    stdout: stdout.trim(),
                    stderr: 'Memory Limit Exceeded',
                    exitCode: 137,
                    time: duration,
                    memory: config.memoryLimit,
                    error: 'Memory Limit Exceeded'
                };
            }

            return {
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: data.State.ExitCode,
                time: Math.min(duration, maxTime),
                memory: 0 // Placeholder
            };

        } catch (error: any) {
            logger.error('IsolationManager Critical Error', error);
            return {
                stdout: '',
                stderr: error.message || 'System Error',
                exitCode: 1,
                time: 0,
                memory: 0,
                error: error.message
            };
        } finally {
            // Cleanup
            if (container) {
                await container.remove({ force: true }).catch(() => { });
            }
            // Remove Host Dir
            try {
                await fs.rm(hostDir, { recursive: true, force: true });
            } catch (e) { }
        }
    }

    private demuxDockerLog(buffer: Buffer): { stdout: string; stderr: string } {
        let stdout = '';
        let stderr = '';
        let offset = 0;

        while (offset < buffer.length) {
            const type = buffer[offset];
            const size = buffer.readUInt32BE(offset + 4);

            if (offset + 8 + size > buffer.length) break; // Partial frame check

            const content = buffer.slice(offset + 8, offset + 8 + size).toString('utf8');

            if (type === 1) stdout += content;
            else if (type === 2) stderr += content;

            offset += 8 + size;
        }

        return { stdout, stderr };
    }
}
