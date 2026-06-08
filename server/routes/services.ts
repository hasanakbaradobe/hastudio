import { Router } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const servicesRouter = Router();

let servicesCache: any[] | null = null;
let serviceDetailCache: Record<string, any> = {};

// GET all services (public)
servicesRouter.get("/", async (req, res) => {
  try {
    if (servicesCache) {
      res.json(servicesCache);
      return;
    }
    const [rows] = await pool.query("SELECT * FROM services ORDER BY display_order ASC, created_at DESC");
    servicesCache = rows as any[];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET single service by slug (public)
servicesRouter.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  if (serviceDetailCache[slug]) {
    res.json(serviceDetailCache[slug]);
    return;
  }
  try {
    const [rows]: any = await pool.query("SELECT * FROM services WHERE slug = ?", [slug]);
    const service = rows[0];
    if (!service) {
       res.status(404).json({ error: "Service not found" });
       return;
    }
    // Fetch associated service FAQs
    const [faqs]: any = await pool.query("SELECT * FROM service_faqs WHERE service_id = ?", [service.id]);
    // Fetch associated service packages
    const [packages]: any = await pool.query("SELECT * FROM service_packages WHERE service_id = ?", [service.id]);
    const formattedPackages = (packages || []).map((p: any) => {
      let parsedFeatures = [];
      try {
        parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []);
      } catch (e) {
        parsedFeatures = [];
      }
      return { ...p, features: parsedFeatures };
    });
    const result = { ...service, faqs: faqs || [], packages: formattedPackages };
    serviceDetailCache[slug] = result;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// GET all FAQs of a service (Public or Protected Admin)
servicesRouter.get("/:serviceId/faqs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM service_faqs WHERE service_id = ?", [req.params.serviceId]);
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// GET all Packages of a service (Public or Protected Admin)
servicesRouter.get("/:serviceId/packages", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM service_packages WHERE service_id = ?", [req.params.serviceId]);
    const formatted = (rows as any[] || []).map(r => {
      let parsedFeatures = [];
      try {
        parsedFeatures = typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []);
      } catch (e) {
        parsedFeatures = [];
      }
      return { ...r, features: parsedFeatures };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// POST a new FAQ for a service (Protected Admin)
servicesRouter.post("/:serviceId/faqs", authenticateToken, async (req, res) => {
  const { question, answer } = req.body;
  const serviceId = Number(req.params.serviceId);
  try {
    const [result]: any = await pool.query(
      "INSERT INTO service_faqs (service_id, question, answer) VALUES (?, ?, ?)",
      [serviceId, question, answer]
    );
    serviceDetailCache = {}; // Invalidate cache
    res.status(201).json({ id: result.insertId, service_id: serviceId, question, answer });
  } catch (error) {
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

// POST a new package for a service (Protected Admin)
servicesRouter.post("/:serviceId/packages", authenticateToken, async (req, res) => {
  const { name, price, badge, description, features } = req.body;
  const serviceId = Number(req.params.serviceId);
  try {
    const [result]: any = await pool.query(
      "INSERT INTO service_packages (service_id, name, price, badge, description, features) VALUES (?, ?, ?, ?, ?, ?)",
      [serviceId, name, price, badge || null, description || null, JSON.stringify(features || [])]
    );
    serviceDetailCache = {}; // Invalidate cache
    res.status(201).json({ id: result.insertId, service_id: serviceId, name, price, badge, description, features });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create package tier" });
  }
});

// PUT update an FAQ (Protected Admin)
servicesRouter.put("/faqs/:faqId", authenticateToken, async (req, res) => {
  const { question, answer } = req.body;
  const faqId = Number(req.params.faqId);
  try {
    await pool.query(
      "UPDATE service_faqs SET question = ?, answer = ? WHERE id = ?",
      [question, answer, faqId]
    );
    serviceDetailCache = {}; // Invalidate cache
    res.json({ message: "FAQ updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// PUT update a package (Protected Admin)
servicesRouter.put("/packages/:packageId", authenticateToken, async (req, res) => {
  const { name, price, badge, description, features } = req.body;
  const packageId = Number(req.params.packageId);
  try {
    await pool.query(
      "UPDATE service_packages SET name = ?, price = ?, badge = ?, description = ?, features = ? WHERE id = ?",
      [name, price, badge || null, description || null, JSON.stringify(features || []), packageId]
    );
    serviceDetailCache = {}; // Invalidate cache
    res.json({ message: "Package tier updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update package tier" });
  }
});

// DELETE an FAQ (Protected Admin)
servicesRouter.delete("/faqs/:faqId", authenticateToken, async (req, res) => {
  const faqId = Number(req.params.faqId);
  try {
    await pool.query("DELETE FROM service_faqs WHERE id = ?", [faqId]);
    serviceDetailCache = {}; // Invalidate cache
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// DELETE a package (Protected Admin)
servicesRouter.delete("/packages/:packageId", authenticateToken, async (req, res) => {
  const packageId = Number(req.params.packageId);
  console.log("[Route DELETE package] Hit! packageId:", req.params.packageId, "parsed:", packageId);
  try {
    await pool.query("DELETE FROM service_packages WHERE id = ?", [packageId]);
    console.log("[Route DELETE package] Query executed successfully for ID:", packageId);
    serviceDetailCache = {}; // Invalidate cache
    res.json({ message: "Package tier deleted successfully" });
  } catch (error) {
    console.error("Error deleting package tier:", error);
    res.status(500).json({ error: "Failed to delete package tier" });
  }
});

// POST new service (Protected Admin)
servicesRouter.post("/", authenticateToken, async (req, res) => {
  const { title, slug, description, features, pricing, featured_image, seo_title, seo_description } = req.body;
  try {
    const [result]: any = await pool.query(`
      INSERT INTO services (title, slug, description, features, pricing, featured_image, seo_title, seo_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, slug, description, 
      JSON.stringify(features || []), 
      pricing, featured_image, seo_title, seo_description
    ]);
    servicesCache = null; // Invalidate cache
    res.status(201).json({ id: result.insertId, message: "Service created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT update service (Protected Admin)
servicesRouter.put("/:id", authenticateToken, async (req, res) => {
  const { title, slug, description, features, pricing, featured_image, seo_title, seo_description } = req.body;
  try {
    await pool.query(`
      UPDATE services 
      SET title = ?, slug = ?, description = ?, features = ?, pricing = ?, featured_image = ?, seo_title = ?, seo_description = ?
      WHERE id = ?
    `, [
      title, slug, description, 
      JSON.stringify(features || []), 
      pricing, featured_image, seo_title, seo_description,
      req.params.id
    ]);
    servicesCache = null; // Invalidate cache
    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE service (Protected Admin)
servicesRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM services WHERE id = ?", [req.params.id]);
    servicesCache = null; // Invalidate cache
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// POST reorder services
servicesRouter.post("/reorder/bulk", authenticateToken, async (req, res) => {
  const { reorderedIds } = req.body;
  if (!Array.isArray(reorderedIds)) {
    return res.status(400).json({ error: "Invalid reorderedIds" });
  }
  
  try {
    for (let i = 0; i < reorderedIds.length; i++) {
        await pool.query("UPDATE services SET display_order = ? WHERE id = ?", [i, reorderedIds[i]]);
    }
    servicesCache = null; // Invalidate cache
    res.json({ message: "Services reordered" });
  } catch (error) {
     res.status(500).json({ error: "Failed to reorder services" });
  }
});
