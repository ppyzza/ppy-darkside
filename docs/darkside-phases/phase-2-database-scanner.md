# Phase 2: Database Scanner & Entity Mapping

## Objective
Expand the Knowledge Graph by integrating the actual PostgreSQL schema. Bridge the gap between the application's ORM Entities and the physical database structure.

## Components

### 1. PostgreSQL Schema Scanner
- **Target**: Connect to the local PostgreSQL instance via `pg` client.
- **Detect Capabilities**:
  - Extract Tables, Columns, and Data Types.
  - Identify Foreign Keys to build relationships between tables.
  - Detect Views and Indexes.

### 2. Graph Merge Engine
- **Entity to Table Resolution**: Automatically link the NestJS `@Entity` nodes (discovered in Phase 1) to the actual physical `Table` nodes discovered in this phase.
- **Relation Generation**: Create `READS` and `WRITES` edges bridging the Source Code cluster to the Database cluster.

### 3. UI Enhancements
- Support for "Table" node types with distinct visual styling.
- Impact Analysis capability: Clicking an `Entity` node highlights the affected database `Table` and all related tables via Foreign Keys.

## Success Criteria
- The graph shows direct links between NestJS Repositories, Entities, and physical PostgreSQL tables.
- Foreign key relationships are accurately rendered as graph edges.
