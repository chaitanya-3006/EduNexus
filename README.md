# 🎓 EduNexus

EduNexus is a modern **Learning Management System (LMS)** built using **React (Vite)**, **Node.js**, **Express**, and **MongoDB**.  
It enables students and teachers to interact seamlessly through courses, authentication, and cloud file management.

---

## 🧭 Table of Contents

- [Overview](#overview)  
- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Backend Setup](#backend-setup)  
- [Frontend Setup](#frontend-setup)  
- [Environment Variables](#environment-variables)  
- [Demo Credentials](#demo-credentials)  
- [Deployment](#deployment)

---

## 📖 Overview

EduNexus is designed to simplify learning and course management.  
Teachers can create and manage courses, while students can view, enroll, and interact.  
Authentication, file uploads, and course data are securely handled using **JWT**, **Cloudinary**, and **MongoDB**.

---

## 🧩 Tech Stack

### 🖥️ Frontend
- React (Vite)
- TailwindCSS
- Axios
- React Router DOM
- Lucide React (icons)

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Multer (File Uploads)
- Cloudinary
- bcrypt
- JWT Authentication

---

## ⚙️ Features

✅ Authentication (JWT-based)  
✅ Course management (Create, update, delete, view)  
✅ Role-based access (Student, Teacher, Admin)  
✅ Image & file uploads using **Multer + Cloudinary**  
✅ Responsive UI built with **React + TailwindCSS**  
✅ Deployed on **Render (Backend)** and **Vercel (Frontend)**

---

## 🗂️ Project Structure

```bash
EduNexus/
├── client/                           # Frontend (React + Vite)
│   ├── public/
│   │   └── _redirects                # For routing on Vercel
│   ├── src/                          # React source files
│   ├── .env                          # Frontend environment variables
│   ├── vite.config.js
│   └── package.json
│
├── server/                           # Backend (Express + MongoDB)
│   ├── models/                       # Mongoose models
│   ├── routes/                       # Express routes
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/                        # Helper functions
│   ├── .env                          # Backend environment variables
│   ├── server.js                     # Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

Instructions for installing and running EduNexus locally.

```bash
# Clone the repository
git clone https://github.com/chaitanya-g-3006/EduNexus.git
cd EduNexus
```

---

## ⚡ Backend Setup

```bash
cd server
npm install
npm run dev
```

Your backend should now be running on `http://localhost:5000` (or your specified PORT).

---

## 💻 Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend should now be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create `.env` files in both **client** and **server** directories.

### 🧩 Server (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 💡 Client (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🧪 Demo Credentials

You can use the following test accounts to explore EduNexus:

| Role | Email | Password |
|------|--------|-----------|
| 🧑‍🎓 **Student** | stud01@edunexus.com | stud123 |
| 👨‍🏫 **Teacher** | teach01@edunexus.com | teach123 |
| 🧑‍💼 **Admin** | admin02@edunexus.com | ad123 |



---

## 🌍 Deployment

- **Frontend:** [Vercel](https://vercel.com)  
  Ensure `_redirects` file exists inside `public/` for proper routing.  
  Example `_redirects` file:
  ```
  /*    /index.html   200
  ```

- **Backend:** [Render](https://render.com)  
  Use `server.js` as the entry point.  
  Set your environment variables under the **Environment** section.

---

## 🧠 Author

**Developed by:** [Chaitanya G](https://github.com/chaitanya-g-3006)
