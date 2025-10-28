// routes/authRoutes.js

import express from 'express';
import { User } from '../models/index.js';
import { hashPassword, verifyPassword, createToken, getAuthUser } from '../utils/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
console.log("✅ authRoutes.js loaded");

// ========== Auth Routes ==========

router.post("/register", async (req, res) => {
  const { email, password, name, role = "student" } = req.body;
  console.log("Registering user:", email, name, role);
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ detail: "Email already registered" });
  }

  const user_id = uuidv4();
  const password_hash = await hashPassword(password);
  console.log('Generated hash:', password_hash);

  const newUser = new User({
    id: user_id,
    email,
    password_hash,
    name,
    role,
    created_at: new Date()
  });

  try {
    await newUser.save();
    const token = createToken(user_id, role);
    res.json({ 
        token, 
        user: { id: user_id, email, name, role } 
    });
  } catch (error) {
    res.status(500).json({ detail: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).lean();
  
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  const token = createToken(user.id, user.role);
  res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
  });
});

router.get("/me", getAuthUser, async (req, res) => {
    // req.currentUser is set by getAuthUser middleware
    res.json(req.currentUser);
});

export default router;