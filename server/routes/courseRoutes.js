// routes/courseRoutes.js

import express from 'express';
import { Course, Lecture, Assignment, Submission, Message, Enrollment, User } from '../models/index.js';
import { getAuthUser } from '../utils/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper to check instructor/admin authorization
const checkCourseAuth = async (req, res, next) => {
    const course = await Course.findOne({ id: req.params.course_id }).lean();
    if (!course) {
        return res.status(404).json({ detail: "Course not found" });
    }
    req.course = course; // Attach course to request
    
    const user = req.currentUser;
    if (user.role === "admin" || course.instructor_id === user.id) {
        return next();
    }
    res.status(403).json({ detail: "Not authorized" });
};

// ========== Course Routes ==========

router.post("/courses", getAuthUser, async (req, res) => {
    const user = req.currentUser;
    if (user.role !== "instructor" && user.role !== "admin") {
        return res.status(403).json({ detail: "Only instructors can create courses" });
    }

    const { title, description, thumbnail_url = "" } = req.body;
    
    const course_id = uuidv4();
    const newCourse = new Course({
        id: course_id,
        title,
        description,
        instructor_id: user.id,
        instructor_name: user.name,
        thumbnail_url,
        created_at: new Date()
    });

    try {
        const savedCourse = await newCourse.save();
        // Mongoose automatically converts Date objects to ISO string for JSON output
        res.status(201).json(savedCourse.toObject({ versionKey: false }));
    } catch (error) {
        res.status(500).json({ detail: "Failed to create course" });
    }
});

router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find({}).lean();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ detail: "Failed to load courses" });
    }
});

router.get("/courses/:course_id", async (req, res) => {
    const course = await Course.findOne({ id: req.params.course_id }).lean();
    if (!course) {
        return res.status(404).json({ detail: "Course not found" });
    }
    res.json(course);
});

router.put("/courses/:course_id", getAuthUser, checkCourseAuth, async (req, res) => {
    const { title, description, thumbnail_url } = req.body;
    
    await Course.updateOne(
        { id: req.params.course_id },
        { $set: { title, description, thumbnail_url } }
    );
    
    const updatedCourse = await Course.findOne({ id: req.params.course_id }).lean();
    res.json(updatedCourse);
});

router.delete("/courses/:course_id", getAuthUser, checkCourseAuth, async (req, res) => {
    const course_id = req.params.course_id;
    
    // Perform cascaded deletes
    await Course.deleteOne({ id: course_id });
    await Lecture.deleteMany({ course_id });
    await Assignment.deleteMany({ course_id });
    await Enrollment.deleteMany({ course_id });

    res.json({ message: "Course deleted" });
});

router.post("/courses/:course_id/enroll", getAuthUser, async (req, res) => {
    const user = req.currentUser;
    const course_id = req.params.course_id;

    if (user.role !== "student") {
        return res.status(403).json({ detail: "Only students can enroll" });
    }

    const course = await Course.findOne({ id: course_id });
    if (!course) {
        return res.status(404).json({ detail: "Course not found" });
    }

    const existing = await Enrollment.findOne({ student_id: user.id, course_id });
    if (existing) {
        return res.status(400).json({ detail: "Already enrolled" });
    }

    const enrollment = new Enrollment({
        id: uuidv4(),
        student_id: user.id,
        course_id,
        enrolled_at: new Date()
    });

    await enrollment.save();
    res.json({ message: "Enrolled successfully" });
});

router.get("/courses/:course_id/check-enrollment", getAuthUser, async (req, res) => {
    const enrollment = await Enrollment.findOne({ student_id: req.currentUser.id, course_id: req.params.course_id });
    res.json({ enrolled: enrollment !== null });
});

router.get("/my-courses", getAuthUser, async (req, res) => {
    const user = req.currentUser;
    let courses = [];

    if (user.role === "student") {
        const enrollments = await Enrollment.find({ student_id: user.id }).lean();
        const course_ids = enrollments.map(e => e.course_id);
        courses = await Course.find({ id: { $in: course_ids } }).lean();
    } else if (user.role === "instructor") {
        courses = await Course.find({ instructor_id: user.id }).lean();
    } else { // admin
        courses = await Course.find({}).lean();
    }
    
    res.json(courses);
});

// ========== Lecture Routes (Abbreviated) ==========

router.post("/courses/:course_id/lectures", getAuthUser, checkCourseAuth, async (req, res) => {
    const { title, video_url, duration = 0, order } = req.body;
    
    const lecture = new Lecture({
        id: uuidv4(),
        course_id: req.params.course_id,
        title, video_url, duration, order, created_at: new Date()
    });

    const savedLecture = await lecture.save();
    res.status(201).json(savedLecture.toObject({ versionKey: false }));
});

router.get("/courses/:course_id/lectures", async (req, res) => {
    const lectures = await Lecture.find({ course_id: req.params.course_id }).sort({ order: 1 }).lean();
    res.json(lectures);
});

// Delete a lecture (no auth)
router.delete("/lectures/:lecture_id", async (req, res) => {
  try {
    const lecture = await Lecture.findOne({ id: req.params.lecture_id }).lean();

    if (!lecture) {
      return res.status(404).json({ detail: "Lecture not found" });
    }

    await Lecture.deleteOne({ id: req.params.lecture_id });
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({ detail: "Failed to delete lecture" });
  }
});

// ===================== Submission Routes =====================

router.post("/assignments/:assignment_id/submit", getAuthUser, async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { file_url } = req.body;
    const student = req.currentUser;

    // Validation
    const assignment = await Assignment.findOne({ id: assignment_id }).lean();
    if (!assignment) {
      return res.status(404).json({ detail: "Assignment not found" });
    }

    if (student.role !== "student") {
      return res.status(403).json({ detail: "Only students can submit assignments" });
    }

    // Prevent duplicate submission
    const existing = await Submission.findOne({ assignment_id, student_id: student.id });
    if (existing) {
      return res.status(400).json({ detail: "You already submitted this assignment" });
    }

    const submission = new Submission({
      id: uuidv4(),
      assignment_id,
      student_id: student.id,
      student_name: student.name,
      file_url,
      submitted_at: new Date(),
    });

    const saved = await submission.save();
    res.status(201).json(saved.toObject({ versionKey: false }));
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ detail: "Submission failed" });
  }
});
// ========================= UPDATE SUBMISSION =========================
router.put("/assignments/:assignment_id/submit", getAuthUser, async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { file_url } = req.body;
    const student = req.currentUser;

    if (student.role !== "student") {
      return res.status(403).json({ detail: "Only students can update submissions" });
    }

    const submission = await Submission.findOne({ assignment_id, student_id: student.id });
    if (!submission) {
      return res.status(404).json({ detail: "No existing submission found" });
    }

    submission.file_url = file_url;
    submission.submitted_at = new Date();

    await submission.save();

    res.json({ message: "Submission updated", submission: submission.toObject({ versionKey: false }) });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({ detail: "Failed to update submission" });
  }
});

router.get("/assignments/submitted", getAuthUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "student")
      return res.status(403).json({ detail: "Only students can view submissions" });

    const submissions = await Submission.find({ student_id: req.currentUser.id }).lean();
    const submittedIds = submissions.map((s) => s.assignment_id);
    res.json(submittedIds);
  } catch (error) {
    res.status(500).json({ detail: "Failed to fetch submitted assignments" });
  }
});

/**
 * ✅ Get all submissions for a specific assignment
 * GET /api/submissions/:assignment_id
 */
router.get("/submissions/:assignment_id", async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const submissions = await Submission.find({ assignment_id });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    res.status(500).json({ detail: "Failed to fetch submissions" });
  }
});
// ===================== Assignment Routes =====================
// Get all assignments for a course
// Get assignments for a course with submission status for current student
router.get("/courses/:course_id/assignments", getAuthUser, async (req, res) => {
  const { course_id } = req.params;
  const user = req.currentUser;

  const assignments = await Assignment.find({ course_id }).lean();

  if (user.role === "student") {
    const submissions = await Submission.find({ student_id: user.id }).lean();

    const submissionMap = new Map();
    submissions.forEach((s) => {
      submissionMap.set(s.assignment_id, s);
    });

    const merged = assignments.map((a) => {
      const submission = submissionMap.get(a.id);
      return {
        ...a,
        isSubmitted: !!submission,
        submission_url: submission ? submission.file_url : null,
        grade: submission ? submission.grade : null,
      };
    });

    return res.json(merged);
  }

  res.json(assignments);
});



// Create a new assignment for a course
router.post("/courses/:course_id/assignments", async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title || !description) {
      return res.status(400).json({ detail: "Title and description are required" });
    }

    const assignment = new Assignment({
      id: uuidv4(),
      course_id: req.params.course_id,
      title,
      description,
      due_date: due_date ? new Date(due_date) : null,
      created_at: new Date(),
    });

    const savedAssignment = await assignment.save();
    res.status(201).json(savedAssignment.toObject({ versionKey: false }));
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ detail: "Failed to create assignment" });
  }
});

// Delete an assignment
router.delete("/assignments/:assignment_id", async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ id: req.params.assignment_id }).lean();

    if (!assignment) {
      return res.status(404).json({ detail: "Assignment not found" });
    }

    await Assignment.deleteOne({ id: req.params.assignment_id });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ detail: "Failed to delete assignment" });
  }
});


// ===================== Chat Routes =====================


// Create message
router.post("/courses/:course_id/messages", async (req, res) => {
  const { sender_id, sender_name, sender_role, message } = req.body;
  const msg = new Message({
    id: uuidv4(),
    course_id: req.params.course_id,
    sender_id,
    sender_name,
    sender_role,
    message,
    created_at: new Date()
  });
  await msg.save();
  res.status(201).json(msg.toObject({ versionKey: false }));
});

// Get all messages
router.get("/courses/:course_id/messages", async (req, res) => {
  const messages = await Message.find({ course_id: req.params.course_id })
    .sort({ created_at: 1 })
    .lean();
  res.json(messages);
});

// ========== Admin Routes (Abbreviated) ==========

router.get("/admin/users", getAuthUser, async (req, res) => {
    if (req.currentUser.role !== "admin") {
        return res.status(403).json({ detail: "Admin only" });
    }
    
    // Exclude password_hash
    const users = await User.find({}, { password_hash: 0 }).lean();
    res.json(users);
});

router.delete("/admin/users/:user_id", getAuthUser, async (req, res) => {
    if (req.currentUser.role !== "admin") {
        return res.status(403).json({ detail: "Admin only" });
    }
    const user_id = req.params.user_id;

    // Cascaded deletes
    await User.deleteOne({ id: user_id });
    await Course.deleteMany({ instructor_id: user_id });
    await Enrollment.deleteMany({ student_id: user_id });
    
    res.json({ message: "User deleted" });
});

export default router;