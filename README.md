🎓 EduNexus — Full Stack Learning Platform

EduNexus is a full-stack web application built using React (Vite) for the frontend and Node.js + Express for the backend, with MongoDB as the database.
It provides features like user authentication, course management, and assignment submissions for teachers and students.

🚀 Tech Stack
Frontend

⚛️ React (Vite)

💨 TailwindCSS

🎨 Radix UI / Lucide Icons

🔄 Axios for API communication

🌈 React Router DOM for navigation

Backend

🧠 Node.js with Express.js

🔒 JWT Authentication

🧩 Mongoose for MongoDB ORM

☁️ Cloudinary for file uploads

🪣 Multer for handling uploads

🗂️ Project Structure
EduNexus/
│
├── client/                # Frontend (React + Vite)
│   ├── public/
│   │   ├── _redirects     # For routing on Vercel
│   ├── src/               # React source files
│   ├── .env               # Frontend environment variables
│   ├── vite.config.js
│   └── package.json
│
├── server/                # Backend (Express + MongoDB)
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── uploadRoutes.js
│   ├── utils/             # Helper functions
│   ├── .env               # Backend environment variables
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md

⚙️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/chaitanya-3006/EduNexus.git
cd EduNexus

2️⃣ Setup Backend
cd server
npm install

Create a .env file inside /server with the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


Start the backend:

npm run dev


or for production:

npm start

3️⃣ Setup Frontend
cd ../client
npm install

Create a .env file inside /client:
VITE_API_URL=https://your-backend-deployed-url.onrender.com


Run the frontend:

npm run dev

4️⃣ Build for Production
npm run build


You can then deploy the /client/dist folder on Vercel or Netlify.
Backend can be deployed on Render, Railway, or Vercel Functions.

🌐 Deployment Setup
Frontend (Vercel)

Root directory → client

Build command → npm run build

Output directory → dist

Add _redirects file in client/public containing:

/*    /index.html   200


Add environment variable VITE_API_URL = your backend URL

Backend (Render)

Root directory → server

Start command → npm start

Environment variables → as per your .env file

🧑‍💻 Scripts
Frontend
Command	Description
npm run dev	Starts the Vite development server
npm run build	Builds for production
npm run preview	Previews the production build
Backend
Command	Description
npm run dev	Starts server with nodemon
npm start	Starts server in production mode
🧠 Features

✅ Authentication (Register/Login)
✅ Role-based Access (Teacher / Student)
✅ Course and Assignment Management
✅ File Upload with Cloudinary
✅ MongoDB Integration
✅ Responsive UI with TailwindCSS


🧪 Demo Credentials

You can use the following demo accounts to test the EduNexus platform:

👨‍🎓 Student

Email: stud01@edunexus.com

Password: stud123

👩‍🏫 Teacher

Email: teach01@edunexus.com

Password: teach123

👨‍🎓 Admin

Email: admin02@edunexus.com

Password: ad123


🤝 Contributing

Fork the repository

Create your branch (git checkout -b feature/new-feature)

Commit changes (git commit -m "Add new feature")

Push to branch (git push origin feature/new-feature)

Open a Pull Request

🧾 License

This project is licensed under the MIT License.
