# 🌐 Multi-Language Support Guide

## ✅ All Languages Now Supported!

The code executor now supports **JavaScript, Python, Java, and C++** via the backend Docker service.

---

## 🧪 Test Solutions for "Two Sum" Problem

### **JavaScript**
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
```

### **Python**
```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []
```

### **Java**
```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
```

### **C++**
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};
```

---

## 🚀 How It Works

### **Backend Integration**
1. **Primary**: Code is sent to backend API (`http://localhost:3001/api/v1/submissions/run`)
2. **Docker Execution**: Backend runs code in isolated Docker containers
3. **Test Validation**: Results are compared against expected outputs
4. **Fallback**: If backend is unavailable, JavaScript runs client-side

### **Execution Flow**
```
User Code → Frontend → Backend API → Docker Container → Execution → Results → Frontend
                ↓ (if backend down)
         Client-side JS execution
```

---

## 📋 Test Cases

All solutions are tested against these inputs:

1. **Test Case 1**
   - Input: `nums = [2,7,11,15], target = 9`
   - Expected: `[0,1]`

2. **Test Case 2**
   - Input: `nums = [3,2,4], target = 6`
   - Expected: `[1,2]`

3. **Test Case 3**
   - Input: `nums = [3,3], target = 6`
   - Expected: `[0,1]`

---

## ⚙️ Backend Setup

### **Start the Backend**
```bash
cd Backend
npm run dev
```

The backend should start on `http://localhost:3001`

### **Verify Backend is Running**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T...",
  "uptime": 123.45
}
```

---

## 🎯 Language-Specific Notes

### **JavaScript**
- ✅ Works with or without backend
- ✅ Client-side fallback available
- ✅ Fastest execution

### **Python**
- ⚠️ Requires backend Docker service
- ✅ Full standard library support
- ✅ Type hints supported

### **Java**
- ⚠️ Requires backend Docker service
- ✅ Full JDK available
- ✅ Collections framework supported

### **C++**
- ⚠️ Requires backend Docker service
- ✅ STL fully available
- ✅ C++17 standard

---

## 🐛 Troubleshooting

### **"Backend unavailable" message**
- Make sure backend is running: `cd Backend && npm run dev`
- Check backend URL in `.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
- For JavaScript, it will automatically fall back to client-side execution

### **Compilation errors**
- Check syntax for your language
- Make sure class/function names match the template
- Verify all imports are included

### **Wrong Answer**
- Review the test case details in the console
- Check expected vs actual output
- Verify your logic handles edge cases

---

## 🎨 Features

✅ **Multi-language support** - JS, Python, Java, C++
✅ **Real Docker execution** - Isolated, secure containers
✅ **Automatic fallback** - Client-side JS if backend down
✅ **Detailed feedback** - See exact test failures
✅ **Complexity analysis** - Time/space complexity detection
✅ **Stats tracking** - Problems solved count updates
✅ **Celebration animation** - Confetti on success!

---

**Happy Coding in Your Favorite Language! 🚀**
