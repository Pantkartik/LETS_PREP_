import { codeExecutionService } from './src/services/codeExecution.service';

async function testFindKClosestElements() {
    console.log('🧪 Testing Find K Closest Elements with real solution...\n');

    // Correct C++ solution
    const correctSolution = `class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {
        int left = 0, right = arr.size() - k;
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (x - arr[mid] > arr[mid + k] - x) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        vector<int> result;
        for (int i = left; i < left + k; i++) {
            result.push_back(arr[i]);
        }
        return result;
    }
};`;

    const result = await codeExecutionService.executeCode({
        language: 'cpp',
        code: correctSolution,
        testCases: [
            { input: '[1,2,3,4,5]\n4\n3', expectedOutput: '[1,2,3,4]' },
            { input: '[1,2,3,4,5]\n4\n-1', expectedOutput: '[1,2,3,4]' },
            { input: '[1,1,1,10,10,10]\n1\n9', expectedOutput: '[10]' }
        ]
    });

    console.log('📊 Results:');
    console.log('  Status:', result.status);
    console.log('  Passed:', result.passedCount, '/', result.totalCount);
    console.log('  Execution Time:', result.executionTime, 'ms');
    console.log('  Memory Used:', result.memoryUsed, 'MB');

    if (result.status === 'ACCEPTED') {
        console.log('\n✅ SUCCESS! The execution engine is working perfectly!');
        console.log('   - C++ signature parsing ✓');
        console.log('   - Vector input parsing ✓');
        console.log('   - Output validation ✓');
        console.log('   - Test case matching ✓');
    } else {
        console.log('\n❌ Failed:');
        result.testCaseResults.forEach((tc, i) => {
            console.log(`\n  Test Case ${i + 1}:`);
            console.log('    Expected:', tc.expectedOutput);
            console.log('    Actual:', tc.actualOutput);
            console.log('    Error:', tc.error);
        });
    }
}

testFindKClosestElements().catch(console.error);
