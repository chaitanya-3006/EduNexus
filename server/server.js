import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


import { v2 as cloudinary } from 'cloudinary';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

console.log("📦 ENV loaded, connecting to MongoDB...");

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

mongoose.connect(mongoUrl, { dbName })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("☁️ Cloudinary configured");

app.use(cors());
app.use(express.json());

console.log("🧩 Middleware set up");


// Real routes
app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes);
app.use("/api/upload", uploadRoutes);

console.log("🚀 Routes registered");

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err);
  res.status(500).json({ detail: err.message || "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
