import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import compression from "compression";
import { initDB, getDatabaseStatus } from "./server/db.js";
import { authRouter } from "./server/routes/auth.js";
import { servicesRouter } from "./server/routes/services.js";
import { portfolioRouter } from "./server/routes/portfolio.js";
import { blogRouter } from "./server/routes/blog.js";
import { testimonialsRouter } from "./server/routes/testimonials.js";
import { messagesRouter } from "./server/routes/messages.js";
import { mediaRouter } from "./server/routes/media.js";
import { settingsRouter } from "./server/routes/settings.js";
import { dashboardRouter } from "./server/routes/dashboard.js";
import { teamRouter } from "./server/routes/team.js";

async function startServer() {
  // Gracefully initiate database connections (MySQL with simulated fallback)
  await initDB();

  const app = express();
  const PORT = 3000;

  // Use compression middleware to gzip responses (highly reduces transfer size)
  app.use(compression());

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Expose local file uploads with optimizing Cache-Control headers (7 days cache)
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "7d",
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=604800, must-revalidate");
    }
  }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // DB diagnostic endpoint
  app.get("/api/db-status", (req, res) => {
    res.json(getDatabaseStatus());
  });

  app.use("/api/auth", authRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/portfolio", portfolioRouter);
  app.use("/api/blog", blogRouter);
  app.use("/api/testimonials", testimonialsRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/team", teamRouter);

  // Fallback for unmatched API routes to prevent sending index.html
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static files with custom, optimized caching logic
    app.use(express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/") || filePath.includes("\\assets\\")) {
          // Extremely aggressive caching for fingerprinted/immutable assets
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          // Ensure index.html is re-validated to deliver update rollouts instantly
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      }
    }));
    // Support React Router HTML5 History
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate"
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
