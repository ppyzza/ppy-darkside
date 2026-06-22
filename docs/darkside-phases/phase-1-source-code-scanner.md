# Phase 1: Core Engine & Source Code Scanner MVP

## Objective
Establish the foundational graph engine and prove the concept by parsing the NestJS source code using Abstract Syntax Trees (AST). The goal is to successfully map dependencies and render them visually.

## Components

### 1. AST Scanner (Backend)
- **Library**: `ts-morph`
- **Target**: Parse `/Users/mrppy/worklife-core-hr-service`
- **Detect Capabilities**:
  - Extract classes with decorators: `@Controller`, `@Injectable`, `@Entity`, `@Module`
  - Analyze constructor injection to find dependencies (e.g., `LeaveController` -> `LeaveService`)
  - Detect `Repository<Entity>` usage to infer database reads/writes.
- **Output**: Generates a standardized JSON graph containing `Nodes` and `Edges`.

### 2. Knowledge Store
- **Storage**: In-memory JSON or lightweight local SQLite to store nodes and relations.
- **Graph Schema**: Standardize the structure for nodes (ID, Type, Label) and edges (Source, Target, Relation Type).

### 3. Graph Explorer UI (Frontend)
- **Library**: `reactflow` (or `cytoscape.js`)
- **UI Layout**: Windows XP split-pane view.
  - Left Panel: Graph visualization canvas.
  - Right Panel: "Node Details" displaying connected dependencies and dependents.
- **Actions**: Users can run the scanner and interact with the resulting graph.

## Success Criteria
- The UI can successfully render the NestJS architectural graph of `worklife-core-hr-service`.
- Clicking a Service node correctly displays its injected dependencies.
