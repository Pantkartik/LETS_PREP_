/**
 * Production-Grade Output Normalizer
 * Used by LeetCode, Codeforces, HackerRank
 * 
 * Handles:
 * - Whitespace normalization
 * - Line ending differences (Windows/Unix)
 * - Trailing spaces
 * - Empty lines
 * - Case sensitivity (configurable)
 */

export interface NormalizationOptions {
    trimLines?: boolean;
    removeEmptyLines?: boolean;
    caseSensitive?: boolean;
    normalizeWhitespace?: boolean;
    preserveLineCount?: boolean;
}

export class OutputNormalizer {
    /**
     * Standard normalization (used in 90% of problems)
     */
    public static normalize(output: string, options: NormalizationOptions = {}): string {
        const {
            trimLines = true,
            removeEmptyLines = true,
            caseSensitive = true,
            normalizeWhitespace = true,
            preserveLineCount = false
        } = options;

        let result = output;

        // 1. Normalize line endings (Windows \r\n -> Unix \n)
        result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 2. Split into lines
        let lines = result.split('\n');

        // 3. Trim each line (remove leading/trailing spaces)
        if (trimLines) {
            lines = lines.map(line => line.trim());
        }

        // 4. Remove trailing empty lines
        while (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }

        // 5. Remove empty lines (unless preserving line count)
        if (removeEmptyLines && !preserveLineCount) {
            lines = lines.filter(line => line.length > 0);
        }

        // 6. Normalize whitespace within lines (multiple spaces -> single space)
        if (normalizeWhitespace) {
            lines = lines.map(line => line.replace(/\s+/g, ' '));
        }

        // 7. Handle case sensitivity
        if (!caseSensitive) {
            lines = lines.map(line => line.toLowerCase());
        }

        // 8. Join back
        result = lines.join('\n');

        return result;
    }

    /**
     * Strict normalization (for problems requiring exact format)
     */
    public static normalizeStrict(output: string): string {
        return this.normalize(output, {
            trimLines: true,
            removeEmptyLines: true,
            caseSensitive: true,
            normalizeWhitespace: false,
            preserveLineCount: false
        });
    }

    /**
     * Lenient normalization (for problems with flexible output)
     */
    public static normalizeLenient(output: string): string {
        return this.normalize(output, {
            trimLines: true,
            removeEmptyLines: true,
            caseSensitive: false,
            normalizeWhitespace: true,
            preserveLineCount: false
        });
    }

    /**
     * Token-based normalization (split by whitespace, compare tokens)
     * Used for problems where order matters but whitespace doesn't
     */
    public static normalizeTokens(output: string): string[] {
        const normalized = this.normalize(output);
        return normalized.split(/\s+/).filter(token => token.length > 0);
    }

    /**
     * Numeric normalization (extract numbers, ignore text)
     * Used for problems with numeric output
     */
    public static normalizeNumeric(output: string): number[] {
        const tokens = this.normalizeTokens(output);
        return tokens
            .map(token => parseFloat(token))
            .filter(num => !isNaN(num));
    }

    /**
     * Check if output contains only valid characters (no prompts, debug logs)
     */
    public static isCleanOutput(output: string): boolean {
        // Check for common debug patterns
        const debugPatterns = [
            /console\.log/i,
            /print\(/i,
            /System\.out/i,
            /cout\s*<</i,
            /\[DEBUG\]/i,
            /\[INFO\]/i,
            /Enter/i,
            /Input/i,
            /Output:/i
        ];

        return !debugPatterns.some(pattern => pattern.test(output));
    }

    /**
     * Remove common debug artifacts
     */
    public static cleanDebugOutput(output: string): string {
        let cleaned = output;

        // Remove lines with common prompts
        const lines = cleaned.split('\n');
        const filteredLines = lines.filter(line => {
            const lower = line.toLowerCase().trim();
            return !lower.startsWith('enter') &&
                !lower.startsWith('input') &&
                !lower.includes('debug') &&
                !lower.includes('[info]') &&
                !lower.includes('[warn]');
        });

        return filteredLines.join('\n');
    }
}
