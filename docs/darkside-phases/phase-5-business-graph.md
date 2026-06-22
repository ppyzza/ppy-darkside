# Phase 5: Business Graph & AI Context Layer

## Objective
Elevate the Knowledge Graph from a technical tool to a business-aligned architectural brain. Provide AI agents with structured graph snapshots to drastically improve their context understanding without reading raw code.

## Components

### 1. Business Domain Integrator
- Connect graph nodes to external documentation sources (Markdown, OpenAPI specs, Jira tickets, ADRs).
- Create new nodes for `Domain`, `Feature`, and `Requirement`.
- Establish relationships: `Requirement` -> `Feature` -> `Controller` -> `Service`.

### 2. AI Context API
- Develop a JSON-based API (`/api/graph/context?node=LeaveService`) designed specifically for consumption by AI models.
- **Output**: Returns a localized snapshot (a subgraph) showing the immediate dependencies, impact radius, and business context of a requested node.
- This prevents AI token limits from being exhausted by providing structured architecture data rather than raw source files.

## Success Criteria
- An AI Agent or Developer can query the graph and instantly understand *why* a piece of code exists (Business context) and *what* it affects (Technical context).
