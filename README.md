# WZSoft — Visual Low-Code Application Platform

[![Java](https://img.shields.io/badge/Java-8-orange)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.6.6-brightgreen)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/license-custom-blue)](LICENSE)

📖 **[Read the story behind WZSoft on dev.to](https://dev.to/wzsoft/i-built-a-turing-complete-visual-low-code-platform-and-taught-an-ai-to-use-it-4p2n)** — why Turing-complete matters, why visual matters, and how an AI learned to operate the platform.

![WZSoft Visual Code Editor](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/pqhuc71rlnggg45z5dmy.png)

---

An enterprise-grade low-code platform built on Spring Boot. Design data models, business logic, workflows, and full applications visually — no hand-coding required for common operations, yet extensible to arbitrary complexity via server-side JavaScript and direct SQL.

## Why WZSoft

**The first low-code platform fully mastered by an AI model.** Describe a business system in one sentence, and Claude can build it end-to-end — data models, forms, permissions, workflows, and PDF reports — all through the platform's standard REST APIs.

This also changes the economics of AI-assisted development. A typical AI coding session spends thousands of tokens re-explaining framework conventions and project context. With WZSoft, the platform's entire operational knowledge lives in the AI's persistent memory. One sentence from you, and the AI already knows your database dialect, your API contract, your permission model, and your component catalog. Orders of magnitude fewer tokens per task.

Beyond that, WZSoft avoids the traps that make other low-code platforms frustrating:

- **Turing-complete visual logic** — not a configurator. Variables, loops, conditionals, subroutines, and I/O give you the full expressive power of a programming language, visually
- **Self-hosted, full control** — deploy on your own servers, own your data
- **Server-side JS engine** — visual logic compiles to JavaScript that runs on the backend (Nashorn), with direct access to the database, message queue, and HTTP clients
- **Direct SQL with row-level security** — query anything, filtered by role-based data permissions automatically
- **One visual editor, full-stack** — the same drag-and-drop node editor works for form hooks, backend logic, workflow nodes, and data permissions. Learn once, build everything
- **All 3 core modules have UI** — data views, code logic, and workflows are all visually configurable, no JSON hand-editing needed

## AI-Powered Development

![AI building a leave management system via conversation](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/sxs70qm7hj0yntl2vc7z.png)

WZSoft is designed to be **machine-operable**. Every operation — creating apps, defining tables, adding form components, configuring workflows, setting permissions — is a standard JSON-over-HTTP REST API. This means an AI model can operate the platform like an expert user.

The file [`CLAUDE.md`](CLAUDE.md) contains the platform's complete operational knowledge base: API contracts, permission model, component catalog, workflow patterns, database dialect abstractions, and patterns accumulated over three years of development.

### Try it with Claude Code

1. Clone this repo and open it in [Claude Code](https://claude.ai/code)
2. Say: *"Build a leave management system with department-level approval and monthly PDF reports for HR"*
3. Claude reads CLAUDE.md, calls the platform's REST APIs, and builds it end-to-end:
   - App structure and page hierarchy
   - Data tables with proper field types
   - Form components with validation rules
   - Approval workflow with routing and code hooks
   - PDF template with variable placeholders
   - Role-based permissions at row and column level

**No more learning curve. Just describe what you need.**

## Architecture

```
User Interface        Business Logic         Data Layer
───────────────      ───────────────        ──────────
┌─────────────┐     ┌──────────────┐       ┌──────────┐
│  Data Views  │────▶│  Nashorn JS  │──────▶│  MySQL   │
│  (auto-gen)  │     │  Engine      │       │  Oracle  │
├─────────────┤     ├──────────────┤       │  KingBase│
│  Code        │────▶│  Spring JDBC │──────▶│  DM      │
│  Designer    │     │  + MyBatis   │       │  SQL Svr │
├─────────────┤     ├──────────────┤       └──────────┘
│  Workflow    │────▶│  Redis       │
│  Designer    │     │              │
└─────────────┘     └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 2.6.6 + Spring Security |
| Scripting | Nashorn (OpenJDK JS engine) |
| ORM | Spring JDBC (JdbcTemplate) + MyBatis |
| Auth | JWT + Redis Session + Role-based access control |
| Cache | Redis |
| Discovery | Nacos |
| PDF | iText + Flying Saucer (HTML→PDF) |
| Export | OpenCSV |
| Frontend | Vue 3 + ECharts + Axios |
| Runtime | Java 8, WAR deployment |

## Features

### Visual Data Management
Define tables, fields, and data views through the admin UI. The platform auto-generates CRUD pages with search, pagination, export (CSV/PDF), and role-based row-level security.

### Visual Code Designer
Build backend logic with a drag-and-drop node editor. Supports variables, database operations, HTTP calls, conditions, loops, subroutines, and messaging. Compiled to JavaScript and executed server-side by the Nashorn engine.

### Visual Workflow Engine
Design approval workflows with a graphical designer. Define nodes, transitions, handlers, and code hooks at each step. Supports multi-person approval, delegation, and rejection.

### Role-Based Access Control
- Users → Roles → Apps → Pages
- Row-level data permissions (SCOPE: own / dept / org / all / custom)
- Column-level field permissions

### Multi-Database Support
Works with MySQL, Oracle, KingBase, Dameng, and SQL Server out of the box. SQL dialect differences are abstracted in the data access layer.

### Messaging & Notifications
Built-in email and SMS integration. Template-based message composition with variable substitution.

## Quick Start

### Prerequisites
- JDK 8+
- Maven 3.6+
- MySQL 5.7+ (or Oracle / KingBase / DM / SQL Server)
- Redis 5+

### Setup

1. **Clone and configure database**
   ```bash
   git clone https://github.com/szwilsonchan/wzsoft.git
   cd wzsoft
   ```

2. **Create database**
   ```sql
   CREATE DATABASE dbwzsoft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Initialize tables**
   Run the SQL file for your database from the `db/` directory:
   ```bash
   mysql -u root -p dbwzsoft < db/mysqltbl.txt
   ```

4. **Edit `src/main/resources/application.properties`**
   ```properties
   spring.datasource.url=jdbc:mysql://your-host:3306/dbwzsoft
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   spring.redis.host=your-redis-host
   spring.redis.password=your-redis-password
   filesvr=/path/to/your/filesvr
   ```

5. **Build and run**
   ```bash
   mvn clean package -DskipTests
   # Deploy target/main-0.0.1-SNAPSHOT.war to Tomcat, or:
   java -jar target/main-0.0.1-SNAPSHOT.war
   ```

6. **Login**
   Open `http://localhost:8080/main-0.0.1-SNAPSHOT/manage/login.html`
   - Default admin: `admin` / `111111`

### First Steps After Login

1. **Create an organization** — Admin → Organization Management
2. **Create a department** — Assign it to the organization
3. **Create a user** — Link to org, dept, and role
4. **Build your first data view** — Admin → Data Management → New Data View
5. **Or let AI do it** — See [AI-Powered Development](#ai-powered-development) above

### Database Scripts

| Database | Script |
|----------|--------|
| MySQL | `db/mysqltbl.txt` |
| Oracle | `db/oracletbl.txt` |
| SQL Server | `db/sqltbl.txt` |
| KingBase | `db/kingbasetbl.txt` |
| Dameng | `db/dmtbl.txt` |

## Project Structure

```
wzsoft/
├── src/main/java/com/wzsoft/main/
│   ├── JwtUtil.java              # JWT authentication
│   ├── SecurityConfig.java       # Spring Security setup
│   ├── DatalistRestController.java  # CRUD API (core)
│   ├── DatalistService.java      # Data query/update logic (2000+ lines)
│   ├── CodeGenRestController.java   # Visual code execution API
│   ├── CodeGenService.java       # Nashorn JS engine integration
│   ├── WfmRestController.java    # Workflow API
│   ├── WfmService.java           # Workflow engine
│   └── WSoftUtil.java            # DB adapter, file utils, PDF generation
├── filesvr/
│   ├── manage/                   # Admin management UI (Vue 3)
│   ├── portal/                   # Public portal pages
│   └── upload/                   # User uploads directory
├── db/                           # Database initialization scripts
└── src/main/resources/
    └── application.properties    # Configuration
```

## Configuration Reference

All configuration is in `application.properties`. Key settings:

| Property | Description |
|----------|-------------|
| `dbtype` | Database type: `mysql`, `oracle`, `sqlserver`, `kingbase`, `dm` |
| `spring.datasource.*` | Database connection |
| `spring.redis.*` | Redis connection |
| `filesvr` | Path to the `filesvr/` directory for file storage |
| `gwebsite` | Public URL of the application |
| `loginpage` | Login page path |
| `mailhost/mailusername/mailpassword` | SMTP settings for email notifications |
| `msgkeyid/msgkeysecret/msgtmcode` | SMS gateway credentials |

## FAQ

### Isn't "low-code" just for simple stuff?

Most low-code platforms are **configurators** — you hit a ceiling the moment business logic exceeds their pre-built actions. WZSoft's visual editor compiles to server-side JavaScript (Nashorn), which is **Turing-complete**. Variables, loops, recursion, subroutines, and I/O — anything computable, you can build visually. The only ceiling is what's computable.

### Why visual instead of just writing code?

Two reasons. First, **spatial reasoning** — a conditional branch looks like a branch, a subroutine call looks like a subgraph. Your brain processes structure faster than tokens. Second, **consistency at scale** — every `if` node generates the same JavaScript pattern, every database query goes through the same connection path. The generated code is boring and predictable, which is exactly what you want for business logic that runs reliably for years.

### Can I use this with my existing database?

Yes. WZSoft works with MySQL, Oracle, KingBase, Dameng, and SQL Server. You can connect to an existing database and build data views on top of your tables. The platform handles SQL dialect differences automatically.

### How does the AI integration actually work?

The platform exposes every operation as a REST API — creating apps, defining fields, configuring workflows, setting permissions. The [`CLAUDE.md`](CLAUDE.md) file documents every API contract, configuration pattern, and operational rule. When you use Claude Code with this repo, it reads CLAUDE.md and gains a complete operational understanding of the platform. It can then call the REST APIs directly to build whatever you describe.

## License

This software is **free for personal and learning use**. Commercial use (enterprise deployment, SaaS, resale, or redistribution) requires a paid license. See [LICENSE](LICENSE) for full terms.
