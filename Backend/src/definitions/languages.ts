export interface LanguageConfig {
    id: string;
    name: string;
    image: string;
    sourceFile: string;
    compileCmd?: string | ((file: string) => string[]);
    runCmd: string | ((file: string) => string[]);
    template: string;
    memoryMultiplier: number;
    timeMultiplier: number;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
    cpp: {
        id: 'cpp',
        name: 'C++ 17',
        image: 'gcc:latest',
        sourceFile: 'solution.cpp',
        compileCmd: (file) => ['g++', '-O2', '-std=c++17', '-o', 'solution', file],
        runCmd: () => ['./solution'],
        template: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}


// Helper for parsing vectors (handles [1,2,3] and 1 2 3)
template<typename T>
void parse_vector(istream& is, vector<T>& v) {
    char c;
    if (!(is >> c)) return;
    bool bracket = false;
    if (c == '[') { bracket = true; } 
    else { is.putback(c); }

    while(true) {
        char next;
        is >> next;
        if(next == ']' && bracket) break;
        if(next == ',' || next == ' ') continue;
        
        is.putback(next);
        T val;
        if(!(is >> val)) break;
        v.push_back(val);
        
        if(!bracket && is.eof()) break; // Non-bracket mode stops at EOF or newline? 
        // Actually cin usually skips whitespace. Non-bracket mode is risky for multiple args.
        // Assuming LeetCode style always has brackets for vectors.
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    {{INPUT_PARSER}}

    Solution sol;
    auto result = sol.solve({{ARGS}});

    {{OUTPUT_FORMATTER}}
    return 0;
}`,
        memoryMultiplier: 1,
        timeMultiplier: 1
    },
    python: {
        id: 'python',
        name: 'Python 3',
        image: 'python:3.11-alpine',
        sourceFile: 'solution.py',
        runCmd: (file) => ['python3', file],
        template: `import sys

{{USER_CODE}}

def main():
    {{INPUT_PARSER}}

    sol = Solution()
    result = sol.solve({{ARGS}})

    print(result)

if __name__ == "__main__":
    main()`,
        memoryMultiplier: 2, // Python often uses more memory
        timeMultiplier: 3    // Python is slower
    },
    java: {
        id: 'java',
        name: 'Java 17',
        image: 'eclipse-temurin:17-jdk-alpine',
        sourceFile: 'Solution.java',
        compileCmd: (file) => ['javac', file],
        runCmd: () => ['java', 'Solution'],
        template: `import java.util.*;
import java.io.*;

{{USER_CODE}}

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        {{INPUT_PARSER}}
        
        Solution sol = new Solution();
        Object result = sol.solve({{ARGS}});
        
        System.out.println(result);
    }
}`,
        memoryMultiplier: 2,
        timeMultiplier: 2
    },
    javascript: {
        id: 'javascript',
        name: 'Node.js',
        image: 'node:20-alpine',
        sourceFile: 'solution.js',
        runCmd: (file) => ['node', file],
        template: `
{{USER_CODE}}

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin').toString().split('\\n');

function main() {
    {{INPUT_PARSER}}
    
    const sol = new Solution();
    const result = sol.solve({{ARGS}});
    
    console.log(result);
}

main();`,
        memoryMultiplier: 2,
        timeMultiplier: 2
    }
};
