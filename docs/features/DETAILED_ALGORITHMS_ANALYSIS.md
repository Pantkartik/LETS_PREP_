# detailed_algorithms_analysis.md

This document provides a deep dive into the standard **Design and Analysis of Algorithms (DAA)** techniques applied within the LETS_PREP_ system. It maps high-level features to the specific classical algorithms that power them.

---

## 1. Sorting Algorithms
### Context: Frontend Data Tables & Leaderboard Display
**Feature**: When a user views the "Problems" list or the "Leaderboard" on the frontend, the data is often sorted by Difficulty, Title, or Score.

**Algorithm Used**: **Timsort** (The default sorting algorithm in V8 Node.js/Chrome `Array.prototype.sort`).

### Approach:
Timsort is a hybrid stable sorting algorithm, derived from **Merge Sort** and **Insertion Sort**. It is designed to perform well on many kinds of real-world data.

### Algorithmic Steps:
1.  **Run Identification**: The array is scanned to identify "runs" (consecutive ordered elements).
2.  **Minrun Optimization**: If a run is smaller than a certain "minrun" size, **Insertion Sort** is used to extend it.
3.  **Merge**: The sorted runs are merged using the **Merge Sort** logic.
    *   A stack is used to maintain the runs that need to be merged.
    *   Merging ensures stability and $O(N \log N)$ performance.

### Pseudocode (Simplified Timsort):
```python
MinRun = 32

function insertionSort(arr, left, right):
    for i from left + 1 to right:
        temp = arr[i]
        j = i - 1
        while j >= left and arr[j] > temp:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = temp

function merge(arr, l, m, r):
    # Standard Merge process of two sorted subarrays
    # ...

function timSort(arr, n):
    # Sort individual subarrays of size MinRun
    for i from 0 to n step MinRun:
        insertionSort(arr, i, min((i + MinRun - 1), (n - 1)))

    # Merge groups of size MinRun, then 2*MinRun, etc.
    size = MinRun
    while size < n:
        for left from 0 to n step 2 * size:
            mid = left + size - 1
            right = min((left + 2 * size - 1), (n - 1))
            if mid < right:
                merge(arr, left, mid, right)
        size = 2 * size
```

**Complexity**:
*   **Time**: Best $O(N)$, Average/Worst $O(N \log N)$.
*   **Space**: $O(N)$.

---

## 2. Searching Algorithms
### Context: Database Lookups (Login, Battle Retrieval)
**Feature**: Finding a user by Email or a Battle by ID from the Supabase (PostgreSQL) database.

**Algorithm Used**: **B-Tree Search** (Standard PostgreSQL Indexing).

### Approach:
The database maintains a **B-Tree** (Balanced Tree) structure for Primary Keys and Indices. This allows for rapid log-time lookup rather than scanning the entire table.

### Algorithmic Steps:
1.  **Start at Root**: Begin searching at the root node of the B-Tree.
2.  **Comparison**: Compare the search key $K$ with the keys in the current node.
3.  **Branch Selection**: 
    *   If $K$ is found, stop.
    *   If $K$ is smaller than the first key, move to the first child.
    *   If $K$ is between two keys, move to the child pointer between them.
    *   If $K$ is larger than the last key, move to the last child.
4.  **Leaf Traversal**: Repeat until a leaf node is reached where the actual data pointer resides.

### Pseudocode:
```python
function BTreeSearch(node, key):
    i = 0
    while i < node.n and key > node.keys[i]:
        i += 1
    
    # If key found in this node
    if i < node.n and key == node.keys[i]:
        return (node, i)
    
    # If leaf, key not in tree
    if node.leaf:
        return null
        
    # Recurse on child
    return BTreeSearch(node.children[i], key)
```

**Complexity**:
*   **Time**: $O(\log N)$ (where $N$ is number of rows in table).
*   **Space**: $O(N)$ (stored on disk).

---

## 3. String Matching Algorithms
### Context: Test Case Validation
**Feature**: Comparing the user's code output against the expected solution output.

**Algorithm Used**: **Linear String Comparison** (with Normalization).

### Approach:
Since outputs must match exactly (after trimming whitespace), a direct character-by-character comparison is performed.

### Algorithmic Steps:
1.  **Normalization**: 
    *   Strip trailing whitespaces: `str.trim()`.
    *   Normalize line endings: `str.replace('\r\n', '\n')`.
2.  **Length Check**: If `len(A) != len(B)`, return False.
3.  **Linear Scan**: Iterate index $i$ from $0$ to $N$.
    *   If `A[i] != B[i]`, return False.
4.  **Success**: Return True.

### Pseudocode:
```python
function compare(actual, expected):
    # Pre-processing
    s1 = actual.trim()
    s2 = expected.trim()
    
    if length(s1) != length(s2):
        return False
        
    for i from 0 to length(s1):
        if s1[i] != s2[i]:
            return False
            
    return True
```

**Complexity**:
*   **Time**: $O(L)$ where $L$ is the length of the output string.
*   **Space**: $O(1)$ auxiliary space.

---

## 4. Probabilistic Data Structure
### Context: Real-time Leaderboard (Redis ZSET)
**Feature**: Storing user ranks securely and retrieving them quickly via Redis.

**Algorithm Used**: **Skip List**.

### Approach:
Redis Sorted Sets (`ZSET`) are implemented using **Skip Lists**. A Skip List is a probabilistic data structure that allows $O(\log N)$ search complexity within an ordered sequence of elements.

### Algorithmic Logic:
*   Multiple layers of linked lists.
*   The bottom layer contains all elements.
*   Higher layers act as "express lanes" that skip over fewer elements.
*   Search starts at the top layer and moves right/down to find the target.

**Complexity**:
*   **Search/Insert/Delete**: $O(\log N)$ average.
