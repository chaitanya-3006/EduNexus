// models/index.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'instructor', 'admin'] },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor_id: { type: String, required: true },
  instructor_name: { type: String, required: true },
  thumbnail_url: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

const lectureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  course_id: { type: String, required: true },
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  course_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  file_url: { type: String, default: "" },
  due_date: { type: String, required: true }, // Keeping as string for simplicity, as in Python model
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assignment_id: { type: String, required: true },
  student_id: { type: String, required: true },
  student_name: { type: String, required: true },
  file_url: { type: String, required: true },
  submitted_at: { type: Date, default: Date.now },
  grade: { type: String, default: "" },
}, { versionKey: false });

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  course_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  sender_name: { type: String, required: true },
  sender_role: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

const enrollmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  course_id: { type: String, required: true },
  enrolled_at: { type: Date, default: Date.now },
}, { versionKey: false });


export const User = mongoose.model('User', userSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Lecture = mongoose.model('Lecture', lectureSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);