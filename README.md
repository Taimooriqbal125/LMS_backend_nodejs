# Node.js Express Boilerplate

A professional boilerplate for Node.js using Express.js and Prisma ORM.

## Project Structure

- `src/app.js`: Express application setup and middleware.
- `src/server.js`: Server entry point.
- `src/models/`: Database models (Prisma wrappers).
- `src/routes/`: API route definitions.
- `src/controllers/`: Request handlers.
- `src/middlewares/`: Custom middlewares (e.g., Error Handling).
- `prisma/`: Prisma schema and database migrations.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and adjust as needed. (Currently setup for SQLite).

### 3. Database Migration
```bash
npx prisma migrate dev --name init
```

### 4. Run the Project
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

- `GET /health`: Health check.
- `GET /api/`: Welcome message.
