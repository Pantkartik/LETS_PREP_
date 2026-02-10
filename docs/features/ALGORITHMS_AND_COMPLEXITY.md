# Algorithms and Data Structures Architecture

This document details the core Algorithms and Data Structures (DAA) techniques used in the **LETS_PREP_** platform, specifically focusing on the critical components: **Code Execution Engine** and **Real-Time Leaderboard System**.

---

## 1. Real-Time Leaderboard System (Battle Engine)

**Problem**: Efficiently rank users in real-time as they solve problems during a battle, handling frequent score updates and rank queries.

- **Data Structure Used**: **Redis Sorted Set (ZSET)**
- **Underlying Implementation**: Skip List / Hash Map (in Redis).
- **Constraints**: 
    - Real-time updates (< 50ms latency).
    - High concurrency (multiple users submitting simultaneously).
    - Scores ordered primarily by points (descending), secondary by time (ascending - handled via custom score calculation).

### Algorithm: Rank Management

**Approach**: 
We use the ZSET data structure where every member (User ID) is associated with a floating-point score. Redis maintains the order automatically.

**Steps**:
1.  **Submission**: User submits code -> Result = Pass via Execution Service.
2.  **Score Calculation**: Backend calculates `TotalScore`.
3.  **Atomic Update**: Use `ZADD` to update the user's score in the specific battle key (`battle:{id}:leaderboard`).
4.  **Retrieval**: Use `ZREVRANGE` to fetch top K users for the UI.
5.  **Rank Lookup**: Use `ZREVRANK` to find specific user's position.

**Pseudocode**:
```typescript
// Add or Update User Score
function updateLeaderboard(battleId, userId, points):
    key = "battle:" + battleId + ":leaderboard"
    // O(log N)
    Redis.ZADD(key, points, userId)

// Get Top 10 Participants
function getTopRankers(battleId):
    key = "battle:" + battleId + ":leaderboard"
    // O(log N + K) -> K is 10
    return Redis.ZREVRANGE(key, 0, 9, "WITHSCORES")
```

**Complexity Analysis**:
- **Time Complexity (Update)**: **O(log N)** where $N$ is the number of participants.
- **Time Complexity (Query Top K)**: **O(log N + K)**.
- **Space Complexity**: **O(N)** to store nodes in the Skip List.

---

## 2. Code Execution Engine (Submission Logic)

**Problem**: Safely execute user-submitted code in various languages against multiple test cases and determine correctness.

- **Data Structure Used**: **Queues** (for linear processing), **Hash Maps** (for Configuration).
- **Technique**: **Sequential Linear Scan** with **Normalization**.

### Algorithm: Sequential Test Case Validation

**Approach**: 
Code is executed locally (Dev) or continuously (Prod) via Docker containers. We iterate through defined test cases. If *any* test case fails, the status is determined immediately (though we may run all for analytics).

**Algo Steps**:
1.  **Input Parsing**: Receive code, language, and test cases.
2.  **Containerization**: Select Docker image based on `language` (Hash Map lookup).
3.  **Execution Loop**:
    - For each `test_case` in `test_cases`:
        - Write code to temp file.
        - Run container with strict Time/Memory limits.
        - Capture `stdout` and `stderr`.
        - **Comparison**: `normalize(actual_output) == normalize(expected_output)`.
        - Record result.
4.  **Aggregation**: If `passed_count == total_count`, verdict is `ACCEPTED`.

**Pseudocode (Comparison Logic)**:
```python
function compareOutputs(actual, expected):
    # O(L) where L is length of string
    def normalize(text):
        return text.trim().replace("\r\n", "\n").toLowerCase()
        
    return normalize(actual) == normalize(expected)
```

**Complexity Analysis**:
- **Time Complexity**: **O(T * (E + L))**
    - $T$: Number of Test Cases.
    - $E$: Execution time of user code (bounded by time limit, e.g., 2s).
    - $L$: Length of output string (for comparison).
- **Space Complexity**: **O(M)** for Docker memory limit (e.g., 256MB).

---

## 3. Rate Limiting Algorithm

**Problem**: Prevent abuse of the API and Execution Engine.

- **Data Structure Used**: **Key-Value Store (Redis String)** with TTL.
- **Algorithm**: **Fixed Window Counter**.

**Pseudocode**:
```typescript
function checkRateLimit(userIp, limit, windowSeconds):
    key = "rate_limit:" + userIp
    currentCount = Redis.INCR(key)
    if currentCount == 1:
        Redis.EXPIRE(key, windowSeconds)
    
    if currentCount > limit:
        return false // Block
    return true // Allow
```

**Complexity**:
- **Time**: **O(1)**.
- **Space**: **O(1)** per actively executing user.

---

## 4. Battle Room Matching (Randomized)

**Problem**: Generate unique Room IDs for battles.

- **Algorithm**: **Rejection Sampling**.

**Steps**:
1.  Generate random 6-char alphanumeric string.
2.  Check Database for existence.
3.  If exists, **Collision Detected** -> Retry Step 1.
4.  If unique, Reserve.

**Complexity**:
- **Average Case**: **O(1)** (Collisions are rare due to $32^6$ search space ~ 1 billion combinations).
- **Worst Case**: Unbounded (theoretically), but statistically negligible.
