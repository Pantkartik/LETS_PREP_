export class Validator {
    public static validate(
        actual: string,
        expected: string,
        type: 'exact' | 'float' | 'custom' = 'exact',
        options: any = {}
    ): boolean {
        if (type === 'exact') {
            return this.normalize(actual) === this.normalize(expected);
        }

        if (type === 'float') {
            const epsilon = options.epsilon || 1e-6;
            return Math.abs(parseFloat(actual) - parseFloat(expected)) <= epsilon;
        }

        // Custom validator not implemented yet
        return false;
    }

    private static normalize(output: string): string {
        return output
            .trim()
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }
}
