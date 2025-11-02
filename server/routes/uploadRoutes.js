// routes/uploadRoutes.js

import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // store file in memory

router.post("/", upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded" });
  }

  try {
    // Detect the resource type automatically based on MIME type
    let resourceType = 'auto';
    if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw'; // Force PDFs to upload as raw files
    }

    // Convert file buffer to Base64 Data URI
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: resourceType,
      folder: 'uploads', // optional folder name
    });

    res.json({ url: result.secure_url });
  } catch (e) {
    console.error("Cloudinary upload error:", e);
    res.status(500).json({ detail: `Upload failed: ${e.message}` });
  }
});

export default router;
