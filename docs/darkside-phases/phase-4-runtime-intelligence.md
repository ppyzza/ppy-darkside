# Phase 4: Runtime Intelligence & Flow Explorer

## Objective
Transition the graph from a static structural map to a living, runtime-aware system. Provide developers with tools to trace requests and visualize actual execution paths.

## Components

### 1. NestJS Runtime Interceptor
- Develop an optional interceptor to inject into the `worklife-core-hr-service` app.
- **Metrics Collected**: Request frequency, execution paths, failure rates, and service call chains (e.g., Controller -> Service A -> Service B).

### 2. Flow Explorer Engine
- A dedicated search and trace UI.
- Users input an API endpoint (e.g., `POST /leave-request`).
- The system highlights the entire execution path across the graph, hiding unrelated nodes.

### 3. Change Detection (Incremental Updates)
- Integrate `chokidar` to watch the file system.
- When a developer edits a `.ts` file, re-scan *only* that file and patch the graph incrementally, avoiding full-repo rebuilds.

## Success Criteria
- Developers can visualize the exact flow of a specific API endpoint.
- Node sizes/colors dynamically reflect real-time execution frequency or error states.
