import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const testimonialsRouter = Router();

// GET all testimonials (public)
testimonialsRouter.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// POST new testimonial (Protected)
testimonialsRouter.post("/", authenticateToken, async (req, res) => {
  const { client_name, company, rating, review, photo } = req.body;
  try {
    const [result]: any = await pool.query(`
      INSERT INTO testimonials (client_name, company, rating, review, photo)
      VALUES (?, ?, ?, ?, ?)
    `, [client_name, company, rating || 5, review, photo]);
    res.status(201).json({ id: result.insertId, message: "Testimonial created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save testimonial" });
  }
});

// PUT update testimonial (Protected)
testimonialsRouter.put("/:id", authenticateToken, async (req, res) => {
  const { client_name, company, rating, review, photo } = req.body;
  try {
    await pool.query(`
      UPDATE testimonials 
      SET client_name = ?, company = ?, rating = ?, review = ?, photo = ?
      WHERE id = ?
    `, [client_name, company, rating || 5, review, photo, req.params.id]);
    res.json({ message: "Testimonial updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

// DELETE testimonial (Protected)
testimonialsRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});
