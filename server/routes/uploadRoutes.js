// routes/uploadRoutes.js

import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for buffer

// ========== Upload Route ==========
router.post("/", upload.single('file'), async (req, res) => {
    // resource_type is extracted from the form data, defaulting to 'auto'
    const resource_type = req.body.resource_type || 'auto'; 

    if (!req.file) {
        return res.status(400).json({ detail: "No file uploaded" });
    }

    try {
        // Convert the buffer into a Base64 data URI
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        // Upload the data URI to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, { 
            resource_type: resource_type 
        });

        res.json({ url: result.secure_url });
    } catch (e) {
        console.error("Cloudinary upload error:", e);
        res.status(500).json({ detail: `Upload failed: ${e.message}` });
    }
});

export default router;