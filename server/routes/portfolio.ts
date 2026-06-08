import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const portfolioRouter = Router();

// GET all portfolios (public)
portfolioRouter.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM portfolios ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolios" });
  }
});

// POST new portfolio (Protected Admin)
portfolioRouter.post("/", authenticateToken, async (req, res) => {
  const { title, category, client_name, description, challenge, solution, result, thumbnail, video_url, featured_status } = req.body;
  try {
    const [resultData]: any = await pool.query(`
      INSERT INTO portfolios (title, category, client_name, description, challenge, solution, result, thumbnail, video_url, featured_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, category, client_name, description, challenge, solution, result, thumbnail, video_url, featured_status ? 1 : 0
    ]);
    res.status(201).json({ id: resultData.insertId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create portfolio" });
  }
});

// GET single portfolio by ID (public)
portfolioRouter.get("/:id", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM portfolios WHERE id = ?", [req.params.id]);
    const portfolio = rows[0];
    if (!portfolio) {
      res.status(404).json({ error: "Portfolio not found" });
      return;
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio item" });
  }
});

// PUT update portfolio (Protected Admin)
portfolioRouter.put("/:id", authenticateToken, async (req, res) => {
  const { title, category, client_name, description, challenge, solution, result, thumbnail, video_url, featured_status } = req.body;
  try {
    await pool.query(`
      UPDATE portfolios 
      SET title = ?, category = ?, client_name = ?, description = ?, challenge = ?, solution = ?, result = ?, thumbnail = ?, video_url = ?, featured_status = ?
      WHERE id = ?
    `, [
      title, category, client_name, description, challenge, solution, result, thumbnail, video_url, featured_status ? 1 : 0,
      req.params.id
    ]);
    res.json({ message: "Portfolio updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update portfolio" });
  }
});

// DELETE portfolio (Protected Admin)
portfolioRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM portfolios WHERE id = ?", [req.params.id]);
    res.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete portfolio" });
  }
});
