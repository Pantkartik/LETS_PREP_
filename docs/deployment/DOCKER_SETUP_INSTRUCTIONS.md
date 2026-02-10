# Docker Setup & Verification

1.  **Ensure Docker Desktop is running.**
    *   If you haven't restarted since installation, please do so now.
    *   Find the Docker whale icon in your taskbar.

2.  **Navigate to the project directory.**
    *   Open your terminal.
    *   Run: `cd C:\LETS_PREP_\Backend`

3.  **Pull Required Docker Images.**
    *   Run: `npx ts-node pull_images.ts`
    *   This ensures all language runtimes (Python, GCC, Java, Node) are available locally.

4.  **Run Verification.**
    *   Run: `npx ts-node verify_engine.ts`
    *   You should see `✅ Test Passed` for all test cases.

## Troubleshooting

-   **Error: Cannot find module './verify_engine.ts'**: You remain in the wrong directory. Make sure you run `cd C:\LETS_PREP_\Backend` first.
-   **Error: connect ENOENT //./pipe/docker_engine**: Docker is not running. Launch Docker Desktop.
