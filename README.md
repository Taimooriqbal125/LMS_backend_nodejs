# LMS Backend System 🎓

A robust Learning Management System (LMS) backend built with **Node.js**, **Express**, and **Prisma**. This system handles advanced user management, academic course flows, and society/extra-curricular activities.

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: SQLite (Development)
- **Security**: 
  - JWT (JSON Web Tokens) for Stateless Auth
  - Bcrypt.js for Password Hashing
  - Helmet & CORS for API Security
- **Utilities**: Morgan (Logging), Nodemailer (Emails), Dotenv

---

## 🚀 Key Features

### 1. Identity & Access Management (IAM)
- **RBAC (Role-Based Access Control)**: Support for ADMIN, INSTRUCTOR, and STUDENT roles.
- **Secure Auth**: JWT-based login and signup flows.
- **Role-Specific Registration**: 
  - **Students**: Includes Academic Ag-No, Program, and Department linking.
  - **Instructors**: Includes Employee No and Department management.

### 2. Academic Management
- **Course Lifecycle**: Instructors can create courses, upload content (YouTube integration), and manage enrollments.
- **Departmental Hierarchy**: Organization by Departments and Programs.
- **Academic Terms**: Management of Fall/Spring cycles and term-based enrollment.

### 3. Extra-Curricular Hub
- **Society Management**: Dedicated logic for Societies, Positions (Incharges/Members), and Event tracking.
- **Event Posters**: Support for event details, timing, and creation.

---

## 📁 Project Structure

```text
├── prisma/               # Database Schema & Migrations
│   ├── schema.prisma     # Main system data models
│   └── seed.js           # Database seeder
├── src/
│   ├── config/           # App & Database configuration
│   ├── controllers/      # Business logic (Auth, Student, Instructor, etc.)
│   ├── middlewares/      # Security & Access Control layers
│   ├── routes/           # API Endpoints
│   ├── utils/            # Helper functions (JWT, Hashing)
│   └── server.js         # Application entry point
├── .env                  # Environment Variables (Ignored by Git)
└── .gitignore            # Security rules for GitHub
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd project001
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_jwt_secret_key"
   JWT_EXPIRES_IN="90d"
   PORT=5000
   ```

4. **Database Setup**:
   Initialize Prisma and the SQLite database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Server**:
   ```bash
   # Development Mode (with nodemon)
   npm run dev

   # Production Mode
   npm start
   ```

---

## 📡 API Endpoints (Quick Reference)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User Authentication |
| `POST` | `/api/student/registerstudent` | Student Onboarding |
| `POST` | `/api/instructor/registerinstructor` | Instructor Onboarding |
| `GET` | `/api/courses` | Fetch available courses |

---

## 🔒 Security
- **Environment Ignored**: Sensitive keys in `.env` are excluded from Git.
- **Database Safety**: The local `dev.db` is ignored to prevent data leakage.
- **Password Safety**: No plain-text passwords are ever stored.

---

## 📄 License
This project is licensed under the **ISC License**.
