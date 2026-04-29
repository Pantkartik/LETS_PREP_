import axios from 'axios';

// Using Base64 to ensure no characters are lost or misinterpreted
const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';

export interface JudgeExecutionResult {
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    time?: string;
    memory?: number;
    status: {
        id: number;
        description: string;
    };
}

export class Judge0Service {
    private static getLanguageId(language: string): number {
        const map: Record<string, number> = {
            'javascript': 93,
            'python': 71,
            'cpp': 54,
            'java': 91
        };
        return map[language.toLowerCase()] || 93;
    }

    private static wrapCode(code: string, language: string): string {
        if (language === 'javascript') {
            const funcMatch = code.match(/(?:function|var|let|const)\s+(\w+)\s*=?\s*(?:function|\()/);
            const funcName = funcMatch ? funcMatch[1] : 'twoSum';

            // Robust Node.js wrapper using process.stdin directly
            const wrapper = `
${code}
const fs = require('fs');
function solve() {
    try {
        const input = fs.readFileSync(0, 'utf8').trim();
        if (!input) return;
        
        // Handle both literal \\n and real newlines
        const lines = input.split(/\\r?\\n|\\\\n/).filter(Boolean);
        const args = lines.map(line => {
            try { return JSON.parse(line.trim()); }
            catch(e) { 
                const val = line.trim();
                return isNaN(val) ? val : Number(val);
            }
        });
        
        const result = typeof ${funcName} === 'function' ? ${funcName}(...args) : null;
        if (result !== null && result !== undefined) {
            process.stdout.write(JSON.stringify(result));
        }
    } catch (err) {
        process.stderr.write(err.message);
    }
}
solve();
            `;
            return Buffer.from(wrapper).toString('base64');
        }

        if (language === 'python') {
            const wrapper = `
import sys, json
${code}
def solve():
    try:
        input_data = sys.stdin.read().splitlines()
        args = []
        for line in input_data:
            if not line.strip(): continue
            try: args.append(json.loads(line))
            except: args.append(line.strip())
        
        if 'Solution' in globals():
            sol = Solution()
            method = [m for m in dir(sol) if not m.startswith('_')][0]
            result = getattr(sol, method)(*args)
        elif 'twoSum' in globals():
            result = twoSum(*args)
        else:
            funcs = [k for k, v in globals().items() if callable(v) and not k.startswith('_')]
            result = globals()[funcs[0]](*args)
            
        if result is not None:
            print(json.dumps(result), end='')
    except Exception as e:
        sys.stderr.write(str(e))
solve()
            `;
            return Buffer.from(wrapper).toString('base64');
        }

        return Buffer.from(code).toString('base64');
    }

    static async execute(code: string, language: string, stdin: string): Promise<JudgeExecutionResult> {
        const languageId = this.getLanguageId(language);
        const encodedCode = this.wrapCode(code, language);
        const encodedStdin = Buffer.from(stdin).toString('base64');
        
        try {
            const response = await axios.post(JUDGE0_URL, {
                source_code: encodedCode,
                language_id: languageId,
                stdin: encodedStdin
            });

            const data = response.data;
            
            // Decode results back from Base64
            return {
                stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf8') : '',
                stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf8') : '',
                compile_output: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf8') : '',
                time: data.time,
                memory: data.memory,
                status: data.status
            };
        } catch (error: any) {
            console.error('[Judge0] API Error:', error.response?.data || error.message);
            throw new Error('Judge0 service unavailable');
        }
    }

    static compare(actual: string, expected: string): boolean {
        const normalize = (str: string) => str.trim().replace(/\\s+/g, '');
        try {
            const a = JSON.parse(actual);
            const b = JSON.parse(expected);
            return JSON.stringify(a) === JSON.stringify(b);
        } catch (e) {
            return normalize(actual) === normalize(expected);
        }
    }
}
