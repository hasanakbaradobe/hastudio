import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const messagesRouter = Router();

// GET all contact messages (Protected)
messagesRouter.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// GET unread messages count (Protected)
messagesRouter.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
    const count = rows && rows[0] ? rows[0].count : 0;
    res.json({ count });
  } catch (error) {
    console.error("[MessagesRouter] error counting unread:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// POST send new contact message (public)
messagesRouter.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required structures." });
    return;
  }
  try {
    const [result]: any = await pool.query(`
      INSERT INTO contact_messages (name, email, subject, message, is_read)
      VALUES (?, ?, ?, ?, 0)
    `, [name, email, subject || "General Inquiry", message]);
    res.status(201).json({ id: result.insertId, message: "Your message has been received! Our creators will reach back soon." });
  } catch (error) {
    res.status(500).json({ error: "Failed to transmit message." });
  }
});

// PUT mark as read (Protected)
messagesRouter.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    await pool.query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [req.params.id]);
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update state." });
  }
});

// DELETE contact message (Protected)
messagesRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});
