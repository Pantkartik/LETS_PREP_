# Project Diagrams

This document contains high-quality Data Flow Diagrams (DFD) and System Flow Diagrams for the LETS_PREP_ platform.

## 1. Data Flow Diagram (DFD) - Level 0 (Context Diagram)

This diagram represents the entire LETS_PREP_ system as a single process, interacting with external entities.

```mermaid
graph TD
    %% Entities
    Student[Student User]
    Teacher[Teacher/Admin]
    ExtAuth[Supabase Auth]
    ExtDB[Supabase Database]
    Docker[Docker Container Engine]

    %% System Process
    System((LETS_PREP_ Platform))

    %% Data Flows - Student
    Student -->|Credentials| System
    Student -->|Code Submission| System
    Student -->|Battle Actions| System
    System -->|Problem Statement| Student
    System -->|Execution Results| Student
    System -->|Leaderboard Updates| Student

    %% Data Flows - Teacher
    Teacher -->|Classroom Config| System
    Teacher -->|Competition Setup| System
    System -->|Student Analytics| Teacher
    System -->|Class Progress| Teacher

    %% Data Flows - External
    System -->|Verify Token| ExtAuth
    ExtAuth -->|User Session| System
    
    System -->|Read/Write Data| ExtDB
    ExtDB -->|User/Problem Data| System

    System -->|Execute Code| Docker
    Docker -->|Output/Logs| System

    %% Styling
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef process fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,rx:10,ry:10;
    
    class Student,Teacher,ExtAuth,ExtDB,Docker entity;
    class System process;
```

---

## 2. Data Flow Diagram (DFD) - Level 1

This diagram breaks down the system into its core functional sub-processes.

```mermaid
graph LR
    %% External Entities
    User[User]
    DB[(Supabase DB)]
    Runner[Code Runner / Docker]

    %% Processes
    P1((1.0 Auth Management))
    P2((2.0 Problem Management))
    P3((3.0 Code Execution))
    P4((4.0 Battle/Comp Engine))

    %% Flow: Auth
    User -->|Login Info| P1
    P1 -->|Session Token| User
    P1 -->|User Profile| DB

    %% Flow: Problems
    User -->|Request Problem| P2
    DB -->|Problem Details| P2
    P2 -->|Problem Content| User

    %% Flow: Execution
    User -->|Submit Code| P3
    P3 -->|Fetch Test Cases| DB
    P3 -->|Run in Sandbox| Runner
    Runner -->|Raw Output| P3
    P3 -->|Verdict| User
    P3 -->|Save Submission| DB

    %% Flow: Battles
    User -->|Join Room| P4
    P4 -->|Sync State| DB
    P4 -->|Real-time Updates| User
    P3 -.->|Submission Result| P4

    %% Styling
    classDef entity fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef process fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef store fill:#e0f2f1,stroke:#00695c,stroke-width:2px;

    class User,Runner entity;
    class P1,P2,P3,P4 process;
    class DB store;
```

---

## 3. System Flow Diagram (Sequence) - Code Submission Flow

This details the exact sequence of events when a user submits a solution.

```mermaid
sequenceDiagram
    autonumber
    participant U as User (Frontend)
    participant API as Backend API
    participant S as Service Layer
    participant D as Docker/Sandbox
    participant DB as Supabase DB

    Note over U: User clicks "Submit"

    U->>API: POST /api/v1/submissions (code, lang, problemId)
    activate API
    
    API->>API: Validate Auth Token
    API->>S: executeCode(code, lang, testCases)
    activate S
    
    S->>S: Prepare Container Config
    S->>D: Create & Start Container
    activate D
    
    Note right of D: Code runs against input
    D-->>S: Return Standard Output / Error
    deactivate D
    
    S->>S: Compare Output vs Expected
    S-->>API: Return ExecutionResult (Pass/Fail)
    deactivate S

    alt Execution Passed
        API->>DB: INSERT into submissions (status: ACCEPTED)
    else Execution Failed
        API->>DB: INSERT into submissions (status: WRONG_ANSWER)
    end

    API-->>U: Return JSON Response
    deactivate API

    U->>U: Display Success/Failure Animation
```

---

## 4. System Flow Diagram (Sequence) - Real-time Battle

This details the flow of a multiplayer coding battle.

```mermaid
sequenceDiagram
    autonumber
    participant P1 as Player 1
    participant P2 as Player 2
    participant WS as Socket Server
    participant R as Redis State
    participant DB as Database

    Note over P1: Creates Battle Room

    P1->>WS: Emit: create_room
    WS->>R: Init Room State (Waiting)
    WS-->>P1: Room Created (RoomID)

    P2->>WS: Emit: join_room (RoomID)
    WS->>R: Update Room (Player 2 Added)
    WS-->>P1: Event: player_joined
    WS-->>P2: Event: room_joined

    Note over P1: Starts Battle
    P1->>WS: Emit: start_battle
    WS->>R: Set Status: Active
    WS-->>P1: Event: battle_started (Problem Data)
    WS-->>P2: Event: battle_started (Problem Data)

    Note over P1: Submits Correct Code
    P1->>WS: Emit: submission_success
    WS->>R: Update Score & Leaderboard
    WS-->>P1: Event: game_over (You Won)
    WS-->>P2: Event: game_over (You Lost)

    WS->>DB: Record Battle Result history
```
