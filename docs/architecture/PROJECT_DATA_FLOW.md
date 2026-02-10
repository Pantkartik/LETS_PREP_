# Project Data Flow

This document outlines the detailed data flow architecture of the LETS_PREP_ platform.

## High-Level Architecture

The platform uses a modern microservices-like architecture:
- **Frontend**: Next.js (React) for UI/UX.
- **Backend API**: Node.js/Express for core logic and orchestration.
- **Code Execution Engine**: Isolated Docker containers managed by the Backend.
- **Database**: Supabase (PostgreSQL) for persistent data.
- **Authentication**: Supabase Auth (integrated with Frontend and Backend).
- **Real-time**: Socket.io + Redis for live battles and competitions.

## Detailed Data Flow Diagram (Mermaid)

```mermaid
graph TD
    %% Actors
    User([User / Student])
    Teacher([Teacher / Admin])

    %% Frontend Components
    subgraph Frontend [Frontend (Next.js)]
        UI[User Interface / Pages]
        AuthLib[Supabase Auth Client]
        APIClient[API Client Lib]
        SocketClient[Socket.io Client]
        CodeExecLib[Code Executor Lib]
    end

    %% Backend Services
    subgraph Backend [Backend Server (Express)]
        APIGateway[API Routes / Controllers]
        AuthMw[Auth Middleware]
        SocketSvc[Socket.io Service]
        RedisSvc[Redis Service]
        CodeSvc[Code Execution Service]
    end

    %% External / Infrastructure
    subgraph Infrastructure
        SupabaseAuth[Supabase Auth Service]
        SupabaseDB[(Supabase PostgreSQL)]
        Redis[(Redis Cache/PubSub)]
        Docker[Docker Engine]
    end

    %% Authentication Flow
    User -->|Login/Signup| UI
    UI -->|Authenticate| AuthLib
    AuthLib -->|Verify| SupabaseAuth
    SupabaseAuth -->|Session Token| AuthLib
    AuthLib -->|Store Session| UI

    %% Data Fetching Flow
    UI -->|Fetch User Data / Problems| SupabaseDB
    UI -->|Secure API Request + Token| APIGateway
    APIGateway -->|Validate Token| AuthMw
    AuthMw -->|Check User| SupabaseAuth
    APIGateway -->|Query Data| SupabaseDB

    %% Code Execution Flow
    User -->|Submit Code| UI
    UI -->|Request Execution| CodeExecLib
    CodeExecLib -->|1. Try Client Dispatch| UI
    CodeExecLib -->|2. POST /run| APIGateway
    APIGateway -->|Auth Check| AuthMw
    APIGateway -->|Forward Request| CodeSvc
    CodeSvc -->|Create Container| Docker
    Docker -->|Run Code in Sandbox| Docker
    Docker -->|Return Output| CodeSvc
    CodeSvc -->|Compare Results| APIGateway
    APIGateway -->|Execution Result| CodeExecLib
    CodeExecLib -->|Save Submission| SupabaseDB

    %% Real-time Battle Flow
    User -->|Join Battle| UI
    UI -->|Connect| SocketClient
    SocketClient -->|WS Connection| SocketSvc
    SocketSvc -->|Store Room State| RedisSvc
    RedisSvc -->|Persist/Cache| Redis
    Teacher -->|Create Room| UI
    UI -->|Create Event| SocketClient
    SocketSvc -->|Broadcast Updates| SocketClient
    
    %% Teacher / Management Flow
    Teacher -->|Manage Classes| UI
    UI -->|Teacher Actions| APIGateway
    APIGateway -->|Update Records| SupabaseDB

    %% Styling
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef server fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef ext fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;

    class UI,AuthLib,APIClient,SocketClient,CodeExecLib client;
    class APIGateway,AuthMw,SocketSvc,RedisSvc,CodeSvc server;
    class SupabaseDB,Redis db;
    class SupabaseAuth,Docker ext;
```

## Flow Descriptions

### 1. Authentication Flow
1.  **User Action**: User clicks Login/Signup.
2.  **Frontend**: Uses `supabase-auth-provider.tsx` to communicate with Supabase Auth.
3.  **Supabase**: Validates credentials (User/Pass, OAuth) and returns a JWT Session Token.
4.  **Frontend**: Stores the token in cookies/local storage.
5.  **Secured Requests**: Subsequent requests to the Backend API include the JWT in the `Authorization` header.

### 2. Code Execution Flow (The Core Feature)
1.  **Input**: User types code in the Monaco Editor (Frontend).
2.  **Submission**: User clicks "Run" or "Submit".
3.  **Client-Side Check**: For simple JavaScript, the `CodeExecutor` (Frontend lib) attempts to run it locally (optimization).
4.  **Backend Request**: For other languages (Python, Java, C++) or official submission, the request is sent to `Backend/src/controllers/submission.controller.ts`.
5.  **Service Handling**: `CodeExecutionService` determines the language and requirements.
6.  **Docker Orchestration**: The service spins up a specific Docker image (e.g., `python:3.11-alpine`).
7.  **Execution**: Code is injected and run against test cases. Time/Memory limits are enforced.
8.  **Result Processing**: Output is captured, compared with expected output, and a verdict (Pass/Fail) is generated.
9.  **Response**: Result is sent back to Frontend to display to the user.
10. **Persistence**: If it was a "Submit" action, the result is saved to `SupabaseDB` via `submission.controller.ts`.

### 3. Real-Time Battles (Socket.io)
1.  **Connection**: Frontend connects to the Backend Socket Server (`Backend/src/sockets/index.ts`).
2.  **Room Management**: Users join specific "rooms" (Battle IDs).
3.  **State Management**: Battle state (who is participating, scores, timer) is managed in memory or Redis.
4.  **Live Updates**: When a user passes a test case, an event is emitted. The Backend calculates score updates and broadcasts the new leaderboard to all connected clients in that room.
