// routes/uploadRoutes.js

import express from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded" });
  }

  try {
    let resourceType = "auto";

    // Force PDFs and other docs to use 'raw'
    if (
      req.file.mimetype === "application/pdf" ||
      req.file.mimetype.includes("msword") ||
      req.file.mimetype.includes("officedocument")
    ) {
      resourceType = "raw";
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: resourceType,
      folder: "uploads", // optional
    });

    res.json({ url: result.secure_url });
  } catch (e) {
    console.error("Cloudinary upload error:", e);
    res.status(500).json({ detail: `Upload failed: ${e.message}` });
  }
});

export default router;
