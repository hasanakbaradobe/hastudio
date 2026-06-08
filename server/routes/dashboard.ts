import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticateToken, async (req, res) => {
  try {
    const [servicesRes]: any = await pool.query("SELECT COUNT(*) as count FROM services");
    const [portfoliosRes]: any = await pool.query("SELECT COUNT(*) as count FROM portfolios");
    const [messagesRes]: any = await pool.query("SELECT COUNT(*) as count FROM contact_messages");
    const [blogPostsRes]: any = await pool.query("SELECT COUNT(*) as count FROM blog_posts");

    res.json({
      totalServices: (servicesRes && servicesRes[0]) ? servicesRes[0].count : 0,
      totalProjects: (portfoliosRes && portfoliosRes[0]) ? portfoliosRes[0].count : 0,
      totalMessages: (messagesRes && messagesRes[0]) ? messagesRes[0].count : 0,
      totalBlogPosts: (blogPostsRes && blogPostsRes[0]) ? blogPostsRes[0].count : 0
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
