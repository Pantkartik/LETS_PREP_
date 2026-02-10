import { codeExecutionService } from './src/services/codeExecution.service';

async function verifyFix() {
    console.log('🚀 Verifying C++ Vector & Signature support...');

    const result = await codeExecutionService.executeCode({
        language: 'cpp',
        code: `class Solution {
public:
    vector<int> complexSignature(vector<int>& arr, int k, int x) {
        vector<int> res;
        // Mock logic: return {first_element, k, x} to prove variables are passed correctly
        if(arr.size() > 0) res.push_back(arr[0]);
        res.push_back(k);
        res.push_back(x);
        return res;
    }
};`,
        testCases: [
            {
                input: "[100,200]\n50\n25",
                expectedOutput: "[100,50,25]"
            }
        ]
    });

    console.log('Verdict:', result.status);
    console.log('Results:', JSON.stringify(result.testCaseResults, null, 2));

    if (result.status === 'ACCEPTED') {
        console.log('✅ Fix working! C++ Vector parsing and Signature extraction is correct.');
    } else {
        console.error('❌ Failed');
        console.log('Actual:', result.testCaseResults[0]?.actualOutput);
        console.log('Error:', result.errorMessage || result.testCaseResults[0]?.error);
    }
}

verifyFix().catch(console.error);
