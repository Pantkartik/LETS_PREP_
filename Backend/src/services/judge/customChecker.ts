/**
 * Custom Checker System (LeetCode-style)
 * 
 * Handles:
 * - Multiple valid outputs
 * - Floating point comparison
 * - Order-independent comparison
 * - Range-based validation
 * - Custom validation logic
 */

import { OutputNormalizer } from './outputNormalizer';

export type CheckerResult = {
    passed: boolean;
    message?: string;
    score?: number; // For partial credit (0-1)
};

export type CheckerFunction = (
    userOutput: string,
    expectedOutput: string,
    input: string
) => CheckerResult;

export class CustomChecker {
    /**
     * Standard exact match (after normalization)
     */
    public static exactMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        const normalized1 = OutputNormalizer.normalize(userOutput);
        const normalized2 = OutputNormalizer.normalize(expectedOutput);

        return {
            passed: normalized1 === normalized2,
            message: normalized1 === normalized2 ? 'Correct' : 'Output mismatch'
        };
    }

    /**
     * Floating point comparison with epsilon tolerance
     * Used for problems with decimal answers
     */
    public static floatingPoint(
        userOutput: string,
        expectedOutput: string,
        epsilon: number = 1e-6
    ): CheckerResult {
        const userNums = OutputNormalizer.normalizeNumeric(userOutput);
        const expectedNums = OutputNormalizer.normalizeNumeric(expectedOutput);

        if (userNums.length !== expectedNums.length) {
            return {
                passed: false,
                message: `Expected ${expectedNums.length} numbers, got ${userNums.length}`
            };
        }

        for (let i = 0; i < userNums.length; i++) {
            const diff = Math.abs(userNums[i] - expectedNums[i]);
            if (diff > epsilon) {
                return {
                    passed: false,
                    message: `Number mismatch at position ${i + 1}: expected ${expectedNums[i]}, got ${userNums[i]} (diff: ${diff})`
                };
            }
        }

        return { passed: true, message: 'Correct (within tolerance)' };
    }

    /**
     * Token-based comparison (order matters, whitespace doesn't)
     */
    public static tokenMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        const userTokens = OutputNormalizer.normalizeTokens(userOutput);
        const expectedTokens = OutputNormalizer.normalizeTokens(expectedOutput);

        if (userTokens.length !== expectedTokens.length) {
            return {
                passed: false,
                message: `Expected ${expectedTokens.length} tokens, got ${userTokens.length}`
            };
        }

        for (let i = 0; i < userTokens.length; i++) {
            if (userTokens[i] !== expectedTokens[i]) {
                return {
                    passed: false,
                    message: `Token mismatch at position ${i + 1}: expected "${expectedTokens[i]}", got "${userTokens[i]}"`
                };
            }
        }

        return { passed: true, message: 'Correct' };
    }

    /**
     * Unordered comparison (order doesn't matter)
     * Example: "1 2 3" == "3 1 2"
     */
    public static unorderedMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        const userTokens = OutputNormalizer.normalizeTokens(userOutput).sort();
        const expectedTokens = OutputNormalizer.normalizeTokens(expectedOutput).sort();

        if (userTokens.length !== expectedTokens.length) {
            return {
                passed: false,
                message: `Expected ${expectedTokens.length} elements, got ${userTokens.length}`
            };
        }

        for (let i = 0; i < userTokens.length; i++) {
            if (userTokens[i] !== expectedTokens[i]) {
                return {
                    passed: false,
                    message: `Element mismatch: missing "${expectedTokens[i]}" or extra "${userTokens[i]}"`
                };
            }
        }

        return { passed: true, message: 'Correct (order-independent)' };
    }

    /**
     * Set comparison (duplicates ignored, order doesn't matter)
     * Example: "1 2 2 3" == "3 1 2"
     */
    public static setMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        const userSet = new Set(OutputNormalizer.normalizeTokens(userOutput));
        const expectedSet = new Set(OutputNormalizer.normalizeTokens(expectedOutput));

        if (userSet.size !== expectedSet.size) {
            return {
                passed: false,
                message: `Expected ${expectedSet.size} unique elements, got ${userSet.size}`
            };
        }

        for (const item of expectedSet) {
            if (!userSet.has(item)) {
                return {
                    passed: false,
                    message: `Missing element: "${item}"`
                };
            }
        }

        return { passed: true, message: 'Correct (set match)' };
    }

    /**
     * Range validation (output must be within range)
     * Example: Answer can be any number between 1 and 100
     */
    public static rangeMatch(
        userOutput: string,
        min: number,
        max: number
    ): CheckerResult {
        const userNums = OutputNormalizer.normalizeNumeric(userOutput);

        if (userNums.length === 0) {
            return { passed: false, message: 'No numeric output found' };
        }

        for (const num of userNums) {
            if (num < min || num > max) {
                return {
                    passed: false,
                    message: `Number ${num} is out of range [${min}, ${max}]`
                };
            }
        }

        return { passed: true, message: 'Correct (within range)' };
    }

    /**
     * Line count validation
     */
    public static lineCountMatch(
        userOutput: string,
        expectedLineCount: number
    ): CheckerResult {
        const lines = userOutput.trim().split('\n').filter(l => l.trim().length > 0);

        if (lines.length !== expectedLineCount) {
            return {
                passed: false,
                message: `Expected ${expectedLineCount} lines, got ${lines.length}`
            };
        }

        return { passed: true, message: 'Correct line count' };
    }

    /**
     * Multiple valid outputs (any one is correct)
     * Example: "YES" or "NO" both valid
     */
    public static multipleValidOutputs(
        userOutput: string,
        validOutputs: string[]
    ): CheckerResult {
        const normalized = OutputNormalizer.normalize(userOutput);

        for (const valid of validOutputs) {
            if (normalized === OutputNormalizer.normalize(valid)) {
                return { passed: true, message: 'Correct' };
            }
        }

        return {
            passed: false,
            message: `Expected one of: ${validOutputs.join(', ')}`
        };
    }

    /**
     * Regex pattern matching
     */
    public static regexMatch(
        userOutput: string,
        pattern: RegExp
    ): CheckerResult {
        const normalized = OutputNormalizer.normalize(userOutput);

        if (pattern.test(normalized)) {
            return { passed: true, message: 'Correct format' };
        }

        return {
            passed: false,
            message: `Output doesn't match expected pattern`
        };
    }

    /**
     * JSON comparison (for structured output)
     */
    public static jsonMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        try {
            const userJson = JSON.parse(userOutput.trim());
            const expectedJson = JSON.parse(expectedOutput.trim());

            const isEqual = JSON.stringify(userJson) === JSON.stringify(expectedJson);

            return {
                passed: isEqual,
                message: isEqual ? 'Correct' : 'JSON structure mismatch'
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Invalid JSON output'
            };
        }
    }

    /**
     * Graph/Tree comparison (adjacency list)
     * Handles different valid representations
     */
    public static graphMatch(
        userOutput: string,
        expectedOutput: string
    ): CheckerResult {
        try {
            // Parse adjacency lists
            const parseGraph = (output: string): Map<string, Set<string>> => {
                const graph = new Map<string, Set<string>>();
                const lines = output.trim().split('\n');

                for (const line of lines) {
                    const [node, ...neighbors] = line.trim().split(/\s+/);
                    graph.set(node, new Set(neighbors));
                }

                return graph;
            };

            const userGraph = parseGraph(userOutput);
            const expectedGraph = parseGraph(expectedOutput);

            // Compare graphs
            if (userGraph.size !== expectedGraph.size) {
                return { passed: false, message: 'Different number of nodes' };
            }

            for (const [node, neighbors] of expectedGraph) {
                const userNeighbors = userGraph.get(node);
                if (!userNeighbors) {
                    return { passed: false, message: `Missing node: ${node}` };
                }

                if (userNeighbors.size !== neighbors.size) {
                    return { passed: false, message: `Different neighbors for node ${node}` };
                }

                for (const neighbor of neighbors) {
                    if (!userNeighbors.has(neighbor)) {
                        return { passed: false, message: `Missing edge: ${node} -> ${neighbor}` };
                    }
                }
            }

            return { passed: true, message: 'Correct graph structure' };
        } catch (error) {
            return { passed: false, message: 'Invalid graph format' };
        }
    }
}
