# LocalStack OS 🪟 (Project Darkside)

LocalStack OS is a retro-styled (Windows XP) developer dashboard designed to provide a unified, intuitive GUI for interacting with local development tools, AWS LocalStack services, and PostgreSQL databases. It replaces clunky CLI commands and complex DB management tools with an easy-to-use, unified interface.

## 🌟 Key Features

### 1. S3 Explorer 📁
A full-featured file manager for LocalStack S3 buckets.
- **Bucket Management:** Create and delete buckets.
- **Folder Navigation:** Browse through "folders" (prefixes) intuitively.
- **Object Management:** Upload, download, and delete files.
- **Storage Classes:** View and modify S3 storage classes (STANDARD, GLACIER, INTELLIGENT_TIERING, etc.) instantly.

### 2. SQS Manager 📨
A unified message queue interface for LocalStack SQS.
- **Queue Overview:** View all standard and Dead Letter Queues (DLQ) along with their approximate message counts.
- **Message Inspection:** Receive and read raw message payloads in a clean JSON viewer.
- **Queue Operations:** Purge entire queues or delete specific messages individually.
- **DLQ Redrive:** One-click feature to move messages from a Dead Letter Queue back to its main queue for reprocessing.

### 3. CSV to Seed Wizard 🪄
An intelligent database seeding tool that bridges the gap between CSV templates and database insertions.
- **Database Introspection:** Connects to PostgreSQL to read schemas, table names, column types, and ENUM values in real-time.
- **Smart Mapping:** Automatically maps CSV column headers to database columns.
- **Spreadsheet Editor:** Built-in Excel-like grid to preview, edit, and validate data before exporting (including ENUM dropdown validation).
- **SQL Generation:** Exports data not just as JSON, but as fully idempotent `INSERT ... ON CONFLICT DO UPDATE` (UPSERT) SQL scripts ready to be executed against any environment.

### 4. Database Diff Wizard ⚖️ (Redgate Clone)
A powerful visual comparison tool to synchronize schemas and data between two database environments (e.g., UAT/SIT vs Local).
- **Schema Diff:** Highlights missing tables, new tables, missing columns, and data-type mismatches between Source and Target schemas.
- **Data Diff:** Compares actual row values (up to 1,000 rows) using Primary Keys to detect identical, inserted, deleted, or modified rows.
- **Auto SQL Migration:** Dynamically generates precise `CREATE TABLE`, `ALTER TABLE`, `INSERT`, `UPDATE`, and `DELETE` SQL scripts to instantly sync the Target database with the Source.

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Custom CSS (Windows XP aesthetics using `xp.css` principles)
- **AWS SDK:** `@aws-sdk/client-s3`, `@aws-sdk/client-sqs`
- **Database:** `pg` (Node Postgres Client)
- **Icons:** Native emojis & Retro UI patterns

## 🚀 Getting Started

1. Ensure you have Node.js and LocalStack running.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3333](http://localhost:3333) in your browser to experience the magic!
