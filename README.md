# Academic Final Projects Portal

A full‑stack web app to showcase students’ final projects with advanced search, a public gallery, ratings, and an admin panel for content management.

## Tech Stack
- **Frontend:** React (Router, Axios, Hooks), Vite (dev server)
- **Backend:** Node.js + Express (no ORM)
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh), HttpOnly cookies for refresh
- **Uploads:** Multer for images/videos (saved to `backend/uploads/projects`)

## Features
### Public (Student)
- Browse project list
- **Search & filter** by faculty/department, project name, submission year, study track, technologies
- Free‑text search
- Faculty/Department tree + dedicated faculty page
- View project details (title, topics, description, students, technologies, media, links, documents, average rating)
- **Rate projects** (1–5 stars)

### Admin
- Login / logout
- **Projects CRUD** (full form, edit, delete, media upload, assign faculty & technologies, links & documents)
- **Technologies CRUD**
- **Faculties/Departments CRUD**
- Manage study tracks & academic years
- **CSV import** for bulk projects

## Project Structure (basic)
```
/backend
  /routes (auth, projects, faculties, technologies, users)
  /middleware (authMiddleware)
  /config (db)
  /uploads/projects
/frontend
  (React app)
```

## Prerequisites
- Node.js (LTS recommended)
- PostgreSQL running locally
- Make sure `backend/uploads/projects` folder exists

## Local Setup (Quick Start)

### 1) Backend
```bash
cd backend
npm install
npm start
```
- Backend runs by default on `http://localhost:8000` (or your configured port).

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open the URL shown in the terminal (`http://localhost:5173`).
