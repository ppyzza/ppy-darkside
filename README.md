# LocalStack OS 🪟 (Project Darkside)

LocalStack OS is a retro-styled (Windows XP) developer dashboard designed to provide a unified, intuitive GUI for interacting with local development tools, AWS LocalStack services, and PostgreSQL databases. It replaces clunky CLI commands and complex DB management tools with an easy-to-use, unified interface.

## 🌟 Key Features

### 1. Database Tables 📊
A visual explorer for your local PostgreSQL database.
- Easily view available tables and schema.
- Quickly inspect row data and columns without opening heavy SQL clients.

### 2. S3 File Browser 🪣
A full-featured file manager for LocalStack S3 buckets.
- **Bucket Management:** Create and delete buckets.
- **Folder Navigation:** Browse through "folders" (prefixes) intuitively.
- **Object Management:** Upload, download, and delete files.
- **Storage Classes:** View and modify S3 storage classes (STANDARD, GLACIER, etc.) instantly.

### 3. Terragrunt Inspector 🌍
A specialized tool for managing multi-environment Terragrunt configurations.
- **Cross-Environment Diff:** Compare `.hcl` files across environments (DEV, SIT, UAT, PROD) to spot missing keys.
- **Direct Editing:** Modify values directly in the UI.
- **Auto-Commit:** Instantly commits configuration changes using Git with a customizable commit message.

### 4. SQS Simulator 🚀
A dedicated dashboard for simulating queue-based events.
- **Standard Presets:** Load pre-configured JSON payloads for common flows (e.g., Document Schedule, Time-Off Accrual).
- **Direct Dispatch:** Select a LocalStack queue, modify the JSON, and fire the message directly to trigger your NestJS consumers.

### 5. CSV to Seed Wizard 🪄
An intelligent database seeding tool that bridges the gap between CSV templates and database insertions.
- **Smart Mapping:** Automatically maps CSV column headers to database columns and ENUM values.
- **SQL Generation:** Exports data as fully idempotent `INSERT ... ON CONFLICT DO UPDATE` (UPSERT) SQL scripts ready to be executed against any environment.

### 6. Database Diff Wizard ⚖️ (Redgate Clone)
A powerful visual comparison tool to synchronize schemas and data between two database environments.
- **Schema Diff:** Highlights missing tables, new tables, and data-type mismatches.
- **Auto SQL Migration:** Dynamically generates precise `CREATE TABLE`, `ALTER TABLE`, and `INSERT` SQL scripts to sync environments.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router, Standalone Output)
- **Styling:** Custom CSS (Windows XP aesthetics using `xp.css` principles)
- **AWS SDK:** `@aws-sdk/client-s3`, `@aws-sdk/client-sqs`
- **Database:** `pg` (Node Postgres Client)
- **Containerization:** Docker & Docker Compose

---

## 🚀 Getting Started (Manual Setup)

1. Ensure you have Node.js and LocalStack (`localhost:4566`) running.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3333](http://localhost:3333) in your browser to experience the magic!

---

## 🐳 Getting Started (Docker Version)

You can run LocalStack OS in a completely isolated Docker container. The Docker setup is configured to communicate with your host machine's LocalStack automatically.

1. Ensure Docker Desktop is running.
2. Ensure your actual LocalStack is running on your host machine.
3. Simply run Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
4. Open [http://localhost:3333](http://localhost:3333).

### How the Docker Network Works
By default, LocalStack Studio looks for LocalStack at `http://localhost:4566`. When running inside a Docker container, `localhost` points to the container itself. 

To solve this, the `docker-compose.yml` uses an environment variable:
```yaml
LOCALSTACK_ENDPOINT=http://host.docker.internal:4566
```
This routes the internal Docker traffic back to your Mac/Windows host machine where LocalStack is natively running.
