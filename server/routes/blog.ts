import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const blogRouter = Router();

// GET all blog posts (public)
blogRouter.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM blog_posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// GET blog post by slug (public)
blogRouter.get("/:slug", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM blog_posts WHERE slug = ?", [req.params.slug]);
    const post = rows[0];
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST check / create post (Protected)
blogRouter.post("/", authenticateToken, async (req, res) => {
  const { title, slug, content, category, tags, featured_image, seo_title, seo_description, publish_status } = req.body;
  try {
    const [result]: any = await pool.query(`
      INSERT INTO blog_posts (title, slug, content, category, tags, featured_image, seo_title, seo_description, publish_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, slug, content, category, 
      JSON.stringify(tags || []), 
      featured_image, seo_title, seo_description, publish_status || 'draft'
    ]);
    res.status(201).json({ id: result.insertId, message: "Blog post created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT update post (Protected)
blogRouter.put("/:id", authenticateToken, async (req, res) => {
  const { title, slug, content, category, tags, featured_image, seo_title, seo_description, publish_status } = req.body;
  try {
    await pool.query(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, content = ?, category = ?, tags = ?, featured_image = ?, seo_title = ?, seo_description = ?, publish_status = ?
      WHERE id = ?
    `, [
      title, slug, content, category, 
      JSON.stringify(tags || []), 
      featured_image, seo_title, seo_description, publish_status,
      req.params.id
    ]);
    res.json({ message: "Post updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// DELETE post (Protected)
blogRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM blog_posts WHERE id = ?", [req.params.id]);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});
