# MANAGER — Task Management System
A production-ready full-stack application that provides users with a sleek, performant interface to securely register, authenticate, and manage their personal tasks. The application is designed to be highly responsive, resilient, and horizontally scalable.

## 🚀 Live Demo

- **Frontend Application**: [https://earnest-assessment.vercel.app](https://earnest-assessment.vercel.app/)
- **Backend API Base**: [https://earnest-assessment.onrender.com](https://earnest-assessment.onrender.com/)

> **Note on Free Hosting:** The backend database sleeps during periods of inactivity. The first request/login after a period of rest may take up to 60 seconds to resolve while the backend container spins back up.

## ✨ Features

- **Robust Authentication**: Secure email/password authentication using short-lived JWT Access Tokens and HTTP-only Refresh Tokens for seamless session persistence.
- **Task Management (CRUD)**: Create, read, update, delete, and instantly toggle task completion statuses via optimistic UI updates.
- **Advanced Querying**: Built-in backend pagination, sorting, status filtering, and search functionality.
- **Sleek UI/UX**: Premium dark mode aesthetic with micro-animations, glassmorphism, and responsive layout.
- **Type Safety**: End-to-end type safety using TypeScript, ensuring reliable data flow between components and services.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State/Routing**: React Context, `next/navigation`
- **Data Fetching**: Axios (with custom token interceptors)

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (hosted on Neon Serverless)
- **Authentication**: Custom JWT implementation

## 🏗️ Architecture Overview

The repository follows a clean monolithic structure separating the client and server concerns:

- **`frontend/`**: A Next.js (React) Single Page Application (SPA) utilizing the App Router. It communicates with the backend exclusively via REST APIs.
- **`backend/`**: A stateless Express REST API. It handles business logic, database transactions via Prisma, and authenticates requests using JWTs.

**Request Flow**: 
`Client (Next.js) → Request Interceptor (Axios + Auth Tokens) → Express Router (Backend) → Controller → Service → Prisma ORM → Neon PostgreSQL`

### 🗄️ Database Schema

Managed via **Prisma ORM**, the relational schema is straightforward but robust:
- **`User`**: Securely stores authentication identities (`id`, `name`, `email`, hashed `password`). Has a strict one-to-many relationship with `Task`.
- **`Task`**: Represents a user's todo item (`id`, `title`, `description`, `status` [PENDING/COMPLETED], `userId`).

## 📁 Folder Structure

```text
project-root/
├── backend/
│   ├── prisma/             # Schema definitions & migrations
│   ├── src/
│   │   ├── controllers/    # Request handling & HTTP responses
│   │   ├── routes/         # Express endpoint definitions
│   │   ├── services/       # Core business logic & database interactions
│   │   ├── utils/          # JWT handling, error formatters
│   │   └── app.ts          # Express configuration
│   ├── .env                # Backend environment variables
│   └── package.json
│
└── frontend/
    ├── app/                # Next.js 14 App Router (pages & layouts)
    ├── src/
    │   ├── components/     # Reusable UI components (TaskCard, Navbar, Modals)
    │   ├── context/        # Global state (Auth, Toast notifications)
    │   └── services/       # API integration functions (Axios)
    ├── .env                # Frontend environment variables
    └── package.json
```

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/idaemrot/Earnest-Assessment.git
cd <project-root>
```

### 2. Configure the Backend
Navigate to the backend directory and configure dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_ACCESS_SECRET="your_strong_access_secret"
JWT_REFRESH_SECRET="your_strong_refresh_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

Initialize the database:
```bash
npm run prisma:generate
npm run prisma:push
npm run dev
```
*The backend should now be running on http://localhost:5000*

### 3. Configure the Frontend
Open a new terminal window, navigate to the frontend directory, and configure dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend should now be running on http://localhost:3000*

## 🌐 Deployment

The application is engineered for standard static and serverless cloud deployment:
- **Frontend**: Deployed on **Vercel**. Framework preset should be set to `Next.js`. Environment variable `NEXT_PUBLIC_API_BASE_URL` must point to the live backend URL.
- **Backend**: Deployed on **Render** (Node Webservice). Start command utilizes `npm run build && npm run start`.
- **Database**: Hosted on **Neon Serverless PostgreSQL**.

## 🔌 API Endpoints

### Authentication
- `POST /auth/register`: Create a new user account
- `POST /auth/login`: Authenticate and receive tokens
- `POST /auth/refresh`: Acquire a new Access Token using a Refresh Token
- `POST /auth/logout`: Invalidate the current session

### Tasks
- `GET /tasks`: Retrieve tasks (supports `?page=`, `?limit=`, `?status=`, `?search=`)
- `POST /tasks`: Create a new task
- `GET /tasks/:id`: Retrieve a specific task by ID
- `PATCH /tasks/:id`: Update task title, description, or status
- `DELETE /tasks/:id`: Delete a specific task
- `PATCH /tasks/:id/toggle`: Quickly toggle status between pending/completed

## 📝 Engineering Notes & Decisions

- **Optimistic UI Updates**: Functions affecting task states (such as toggling, deleting) eagerly update the local client state before awaiting the server response to ensure a snappy, zero-latency user experience. Changes automatically revert gracefully if the backend request fails.
- **Decoupled Business Logic**: Backend controllers exclusively manage HTTP protocol handling (req/res patterns), while core database manipulation is isolated within `service` files, making the logic highly re-usable and testable.

## 🔮 Future Improvements
- **Offline Reliability**: Implementing `Service Workers` and localized caching (like IndexedDB or TanStack Query) to allow tasks to be drafted offline.
- **Role-Based Access Control (RBAC)**: Enabling "Admin" roles to view analytics across multiple users.
- **Realtime Syncing**: Migrating polling or refresh actions to a WebSocket implementation / Server Sent Events (SSE) so that tasks dynamically sync across simultaneous browser sessions.
