# Team Task Manager 🚀

Team Task Manager is a collaborative project management and task delegation platform built using modern **React (Vite)**, **Node.js (Express)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

The platform is designed to handle enterprise workloads, featuring robust authentication, role-based controls, and seamless dual-database capabilities.

---

## 🛠️ Key Architectural Features

1. **Dashboard Analytics & Dynamic SVG Metrics**:
   - Custom SVG charts showing real-time task completion ratios.
   - Live state density concentration bars (Done, Active, Pending) and project pipelines lists.
   
2. **Unified Dual-Database Fallback (Production-Ready)**:
   - **MongoDB Atlas Integration**: Leverages native MongoDB models via Mongoose when a connection string is supplied.
   - **Local File Persistence Fallback (`data/db.json`)**: Seamless, safe transition to localized schema models if database URIs are blank. This guarantees immediate zero-startup-delay sandbox testing.

3. **Role-Based Access Control (RBAC)**:
   - **System Administrators (Admins)**: Full workspace orchestration. Create project pipelines, assign team roles, pre-approve teammate signups, modify workspace lists, and teardown resources.
   - **Workspace Members**: Focus on deliverables. Inspect projects, filter task queues, and cycle workload statuses dynamically for tasks assigned to them.

4. **Modern Design Language**:
   - Slate-inspired aesthetic with balanced interactive transitions driven by **Framer Motion**.
   - Fluid typography, touch-friendly components, responsive layouts, and full screen adaptation.

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router DOM, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js, TypeScript Typings, JWT Bearer Cookie tokens, BCrypt hashes.
- **Database Modality**: Mongoose ODM & local fs-based JSON Storage layers.

---

## ⚙️ Environment Variables Setup

Configure these keys inside your `.env` or in platform configurations (such as Railway):

```env
# Server bind configuration
PORT=3000

# MongoDB cluster URI (Leave blank to use local filesystem fallback)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/team_task_manager

# Secret to sign JWT Bearer tokens
JWT_SECRET=supersecuretokenkey2026

# Active workspace address
APP_URL=http://localhost:3000
```

---

## 🚀 Getting Started

To launch development instances, run:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the unified Vite + Express server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to begin coordinate sprints!

---

## 📦 Deployment Workflow (e.g. Railway / Render / CapRover)

This workspace is structured as a **monolithic unified container** using Node ES Module builds:

- **Build Script**: `npm run build` compiling frontend static assets alongside our TypeScript backend server into `dist/server.cjs` via `esbuild`.
- **Start Script**: `npm run start` launching the compiled production file standalone using native `node`.
- For Railway: Just link your repository, load your Environment variables, and Railway handles the deployment end-to-end!
