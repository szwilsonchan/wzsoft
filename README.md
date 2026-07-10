# WZSoft — Visual Low-Code Application Platform

An enterprise-grade low-code platform built on Spring Boot. Design data models, business logic, workflows, and full applications visually — no hand-coding required for common CRUD operations, yet extensible to arbitrary complexity via server-side JavaScript and direct SQL.

## Why WZSoft

**The first low-code platform fully mastered by an AI model.** Describe a business system in one sentence, and Claude can build it end-to-end — data models, forms, permissions, workflows, and PDF reports — all through the platform's standard APIs. No more learning curve. Just describe what you need.

This also changes the economics of AI-assisted development. A typical AI coding session spends thousands of tokens re-explaining framework conventions and project context. With WZSoft, the platform's entire operational knowledge lives in the AI's persistent memory. One sentence from you, and the AI already knows your database dialect, your API contract, your permission model, and your component catalog. Orders of magnitude fewer tokens per task.

Beyond that, WZSoft avoids the traps that make other low-code platforms frustrating:

- **Self-hosted, full control** — deploy on your own servers, own your data
- **Server-side JS engine** — write arbitrary business logic that runs on the backend, not just frontend glue
- **Direct SQL with row-level security** — query anything, filtered by role-based data permissions automatically
- **Visual workflow designer** — drag-and-drop process automation with code hooks at every node
- **All 3 core modules have UI** — data views, code logic, and workflows are all visually configurable, no JSON hand-editing needed

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

## License

This software is **free for personal and learning use**. Commercial use (enterprise deployment, SaaS, resale, or redistribution) requires a paid license. See [LICENSE](LICENSE) for full terms.
