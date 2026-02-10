import { LANGUAGES, LanguageConfig } from '../../definitions/languages';

export class TemplateEngine {
    public static injectCode(
        language: string,
        userCode: string,
        inputParser: string = '',
        args: string = '',
        outputFormatter: string = ''
    ): string {
        const config = LANGUAGES[language];
        if (!config) {
            throw new Error(`Unsupported language: ${language}`);
        }

        let template = config.template;

        // Naive implementation for now - fully replacing tokens
        if (!inputParser) {
            // Attempt to infer from code if not provided
            const sig = this.extractCppSignature(userCode);
            if (sig) {
                inputParser = this.generateCppInputParser(sig.args);
                args = sig.args.map(a => a.name).join(', ');
                outputFormatter = this.generateCppOutputFormatter(sig.returnType);

                // If function name is not solve, replace call in template
                if (sig.name !== 'solve') {
                    template = template.replace('sol.solve', `sol.${sig.name}`);
                }
            }
        }

        template = template.replace('{{USER_CODE}}', userCode);
        template = template.replace('{{INPUT_PARSER}}', inputParser);
        template = template.replace('{{ARGS}}', args);
        template = template.replace('{{OUTPUT_FORMATTER}}', outputFormatter);

        return template;
    }

    private static extractCppSignature(code: string): { name: string, args: { type: string, name: string }[], returnType: string } | null {
        // Match: ReturnType FunctionName(Args...)
        const methodRegex = /class\s+Solution\s*\{[\s\S]*?public:\s*([\w<>:&*]+)\s+(\w+)\s*\(([^)]*)\)/;
        const match = code.match(methodRegex);

        if (!match) return null;

        const returnType = match[1].trim();
        const name = match[2].trim();
        const argsStr = match[3].trim();

        const args = argsStr.split(',').map(arg => {
            const parts = arg.trim().split(/\s+/);
            const varName = parts.pop() || '';
            const type = parts.join(' ');
            return { type, name: varName.replace(/[&*]/g, '') }; // Strip pointers/refs for var name
        });

        return { name, args, returnType };
    }

    private static generateCppInputParser(args: { type: string, name: string }[]): string {
        let code = '';

        args.forEach(arg => {
            const cleanType = arg.type.replace(/[&*]/g, '').trim();

            if (arg.type.includes('vector')) {
                // Vector input: size then elements
                // Or assumed format: [1,2,3] -> Need robust parser or simple assumption
                // Simple assumption: size N then N elements space separated
                // BUT LeetCode inputs are often just the array string.
                // We'll use a JSON-like parser helper injected into main
                code += `
    // Parsing vector<int> ${arg.name} using helper
    ${cleanType} ${arg.name};
    parse_vector(cin, ${arg.name});
`;
            } else {
                code += `
    ${cleanType} ${arg.name};
    cin >> ${arg.name};
`;
            }
        });
        return code;
    }

    private static generateCppOutputFormatter(returnType: string): string {
        if (returnType.includes('vector')) {
            return `
    cout << "[";
    for(size_t i=0; i<result.size(); ++i) {
        cout << result[i] << (i==result.size()-1 ? "" : ",");
    }
    cout << "]" << endl;
`;
        }
        return `cout << result << endl;`;
    }
}
