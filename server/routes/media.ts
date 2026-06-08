import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const mediaRouter = Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Error: Only static images (.jpg, .png, .webp, .gif) are supported!"));
  }
});

// GET all media assets (Protected or Public)
mediaRouter.get("/", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM media_library ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load media files." });
  }
});

// POST Upload a new file (Protected)
mediaRouter.post("/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Please select an image file to upload." });
    return;
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    const [result]: any = await pool.query(`
      INSERT INTO media_library (filename, file_url, file_size, mime_type)
      VALUES (?, ?, ?, ?)
    `, [req.file.originalname, fileUrl, req.file.size, req.file.mimetype]);
    
    res.status(201).json({
      id: result.insertId,
      filename: req.file.originalname,
      file_url: fileUrl,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      message: "Image uploaded and logged in Media Library!"
    });
  } catch (error) {
    res.status(500).json({ error: "File written physically but failed database registration index." });
  }
});

// DELETE media item and physical asset file (Protected)
mediaRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM media_library WHERE id = ?", [req.params.id]);
    const fileItem = rows[0];
    if (!fileItem) {
      res.status(404).json({ error: "File record not found in Database." });
      return;
    }

    // Attempt physical erasure
    const physicalPath = path.join(process.cwd(), "uploads", path.basename(fileItem.file_url));
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    await pool.query("DELETE FROM media_library WHERE id = ?", [req.params.id]);
    res.json({ message: "Media resource removed and erased physically!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to erase media item." });
  }
});
