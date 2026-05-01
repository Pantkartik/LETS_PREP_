import axios from 'axios';
import logger from '../config/logger';

export interface JudgeResult {
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

export class JudgeService {
  private readonly JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';

  private getLanguageId(language: string): number {
    const map: Record<string, number> = {
      'javascript': 93,
      'python': 71,
      'cpp': 54,
      'java': 91
    };
    return map[language.toLowerCase()] || 93;
  }

  private wrapCode(code: string, language: string): string {
    // Basic wrapper to handle competitive coding format (stdin -> function -> stdout)
    if (language === 'javascript') {
      const funcMatch = code.match(/(?:function|var|let|const)\s+(\w+)\s*=?\s*(?:function|\()/);
      const funcName = funcMatch ? funcMatch[1] : 'solution';
      
      const wrapper = `
${code}
const fs = require('fs');
function run() {
    try {
        const input = fs.readFileSync(0, 'utf8').trim();
        if (!input) return;
        const lines = input.split(/\\r?\\n/).filter(Boolean);
        const args = lines.map(line => {
            try { return JSON.parse(line.trim()); }
            catch(e) { return line.trim(); }
        });
        const result = typeof ${funcName} === 'function' ? ${funcName}(...args) : null;
        if (result !== undefined) process.stdout.write(JSON.stringify(result));
    } catch (err) { process.stderr.write(err.message); }
}
run();
      `;
      return Buffer.from(wrapper).toString('base64');
    }

    if (language === 'python') {
      const wrapper = `
import sys, json
${code}
def run():
    try:
        input_data = sys.stdin.read().splitlines()
        args = [json.loads(line) if line.strip() else None for line in input_data]
        args = [a for a in args if a is not None]
        
        # Try to find a Solution class or a global function
        if 'Solution' in globals():
            sol = Solution()
            method = [m for m in dir(sol) if not m.startswith('_')][0]
            result = getattr(sol, method)(*args)
        else:
            funcs = [k for k, v in globals().items() if callable(v) and not k.startswith('_')]
            result = globals()[funcs[0]](*args)
            
        if result is not None: print(json.dumps(result), end='')
    except Exception as e: sys.stderr.write(str(e))
run()
      `;
      return Buffer.from(wrapper).toString('base64');
    }

    return Buffer.from(code).toString('base64');
  }

  public async execute(code: string, language: string, stdin: string): Promise<JudgeResult> {
    const languageId = this.getLanguageId(language);
    const encodedCode = this.wrapCode(code, language);
    const encodedStdin = Buffer.from(stdin).toString('base64');

    try {
      const response = await axios.post(this.JUDGE0_URL, {
        source_code: encodedCode,
        language_id: languageId,
        stdin: encodedStdin
      });

      const data = response.data;
      
      return {
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf8') : '',
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf8') : '',
        compile_output: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf8') : '',
        time: data.time,
        memory: data.memory,
        status: data.status
      };
    } catch (error: any) {
      logger.error('Judge0 execution failed', error.response?.data || error.message);
      throw new Error('Code execution service unavailable');
    }
  }

  public compare(actual: string, expected: string): boolean {
    const normalize = (str: string) => str.trim().replace(/\\s+/g, '');
    try {
      // Try JSON comparison first
      const a = JSON.parse(actual);
      const b = JSON.parse(expected);
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      // Fallback to normalized string comparison
      return normalize(actual) === normalize(expected);
    }
  }
}

export const judgeService = new JudgeService();
export default judgeService;
