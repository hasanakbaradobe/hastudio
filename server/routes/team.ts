import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const teamRouter = Router();

// GET all team members (public)
teamRouter.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM team_members ORDER BY id ASC");
    // Ensure social_links are returned as clean objects/parses if they are stringified
    const members = (rows as any[]).map(member => {
      let social_links = member.social_links;
      if (typeof social_links === 'string') {
        try {
          social_links = JSON.parse(social_links);
        } catch {
          // If fallback parsing fails, keep original
        }
      }
      return {
        ...member,
        social_links
      };
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// GET single team member
teamRouter.get("/:id", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: "Team member not found" });
      return;
    }
    const member = rows[0];
    let social_links = member.social_links;
    if (typeof social_links === 'string') {
      try {
        social_links = JSON.parse(social_links);
      } catch {
        // Fallback
      }
    }
    res.json({ ...member, social_links });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team member" });
  }
});

// POST new team member (Protected)
teamRouter.post("/", authenticateToken, async (req, res) => {
  const { name, role, bio, photo, email, social_links } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: "Name and role are required fields" });
    return;
  }
  
  try {
    const socialLinksStr = typeof social_links === "object" && social_links !== null
      ? JSON.stringify(social_links)
      : social_links || "{}";

    const [result]: any = await pool.query(`
      INSERT INTO team_members (name, role, bio, photo, email, social_links)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, role, bio || "", photo || "", email || "", socialLinksStr]);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: "Team member created successfully" 
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({ error: "Failed to create team member" });
  }
});

// PUT update team member (Protected)
teamRouter.put("/:id", authenticateToken, async (req, res) => {
  const { name, role, bio, photo, email, social_links } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: "Name and role are required" });
    return;
  }

  try {
    const socialLinksStr = typeof social_links === "object" && social_links !== null
      ? JSON.stringify(social_links)
      : social_links || "{}";

    await pool.query(`
      UPDATE team_members 
      SET name = ?, role = ?, bio = ?, photo = ?, email = ?, social_links = ?
      WHERE id = ?
    `, [name, role, bio || "", photo || "", email || "", socialLinksStr, req.params.id]);

    res.json({ message: "Team member updated successfully" });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({ error: "Failed to update team member" });
  }
});

// DELETE team member (Protected)
teamRouter.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[TeamRouter] Attempting to delete team member with ID: ${id}`);
  try {
    const [result]: any = await pool.query("DELETE FROM team_members WHERE id = ?", [id]);
    console.log(`[TeamRouter] Delete successful/run. DB result:`, result);
    res.json({ message: "Team member deleted successfully", result });
  } catch (error: any) {
    console.error("[TeamRouter] Failed to delete team member:", error);
    res.status(500).json({ 
      error: "Failed to delete team member", 
      details: error?.message || String(error) 
    });
  }
});
