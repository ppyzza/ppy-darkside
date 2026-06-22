# Phase 3: Infrastructure Scanner (AWS & Terragrunt)

## Objective
Incorporate the physical deployment infrastructure into the graph. Map application services to their corresponding message queues, buckets, and environments.

## Components

### 1. AWS LocalStack Scanner
- **Target**: `http://localhost:4566`
- **Detect Capabilities**:
  - Discover active S3 Buckets, SQS Queues, and SNS Topics.
  - Map `PUBLISHES` and `CONSUMES` edges by correlating NestJS queue handlers (identified in Phase 1 via `@MessagePattern` or AWS SDK usage) to the actual physical queues.

### 2. Terragrunt/Terraform Scanner
- **Target**: Parse `.hcl` and `.tf` files in the repository.
- **Detect Capabilities**:
  - Extract Modules, Variables, and Dependencies.
  - Link infrastructure-as-code definitions to the physical AWS resources they provision.

### 3. Graph Merge Engine
- Resolve environment variables to link `Service` nodes to their `Terragrunt Config` and `AWS Resource` nodes.

## Success Criteria
- The graph displays the end-to-end flow: Endpoint -> Service -> Publisher -> SQS Queue -> Consumer -> Database.
