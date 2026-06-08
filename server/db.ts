import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

let useMock = false;

// Robust mock database storage representing all user-requested tables
const mockDB: Record<string, any[]> = {
  admins: [
    { id: 1, email: "admin@hastudio.com", password: "$2a$10$tZ21y6L3XOTgC/P3R7/u4.EaG47d83k5P2X/zW.7gXb27L2YpK9sS", role: "admin" }
  ],
  clients: [
    { id: 1, name: "Alexander Wright", company: "CyberX Labs", logo: "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?q=80&w=200", industry: "Tech R&D" },
    { id: 2, name: "Victoria Chen", company: "Aether Cosmetics", logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=200", industry: "SaaS Retail" }
  ],
  team_members: [
    { id: 1, name: "Harry Akber", role: "Founder & Creative Principal", bio: "Leading award-winning projects for interactive video, game designs, and brand transformations over the past decade.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", email: "harry@hastudio.com", social_links: JSON.stringify({ instagram: "https://instagram.com", github: "https://github.com" }) },
    { id: 2, name: "Amelia Dupont", role: "Director of Motion Graphics", bio: "Fusing digital animations with brand pacing to build immersive corporate explainer narratives and campaigns.", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200", email: "amelia@hastudio.com", social_links: JSON.stringify({ linkedin: "https://linkedin.com" }) }
  ],
  services: [
    {
      id: 1,
      title: "Video Editing",
      slug: "video-editing",
      description: "Professional high-end pacing, sequence building, color grading, sound design, and custom cuts for YouTube, commercial, and film campaigns.",
      features: JSON.stringify(["Color Grading", "Sound FX Tuning", "Multi-cam Sync", "Cinema Transitions"]),
      pricing: "From $1,200",
      featured_image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600",
      seo_title: "Professional Video Editing Services | HA Studio",
      seo_description: "Top-tier video editing for brands, creators, and commercials."
    },
    {
      id: 2,
      title: "Motion Graphics",
      slug: "motion-graphics",
      description: "Kinetic typography, 2D/3D visual assets, logo animations, explainer narratives, and promotional video overlays.",
      features: JSON.stringify(["Logo Stings", "Explainer Animations", "Custom Titles", "HUD Elements"]),
      pricing: "From $1,500",
      featured_image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=600",
      seo_title: "Motion Graphics & Animation | HA Studio",
      seo_description: "Stunning kinetic typography, 3D overlays, and explainer animations."
    },
    {
      id: 3,
      title: "Graphic Design",
      slug: "graphic-design",
      description: "Bespoke digital vectors, media banner collaterals, modern layout styling, and promotional posters designed to captivate your audience.",
      features: JSON.stringify(["Vector Assets", "Banner Collaterals", "Typography Styling", "Posters Design"]),
      pricing: "From $800",
      featured_image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600",
      seo_title: "Bespoke Graphic Design Services",
      seo_description: "Captivating typography and vector design to elevate look and feel."
    },
    {
      id: 4,
      title: "Branding Design",
      slug: "branding-design",
      description: "Complete visual identity guidelines, distinct logomarks, matching palettes, typography pairings, and ready-to-print stationeries.",
      features: JSON.stringify(["Logomark Suite", "Palette Guide", "Font Pairings", "Stationery Mockups"]),
      pricing: "From $2,400",
      featured_image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=600",
      seo_title: "Strategic Branding and Brand Identity Design",
      seo_description: "Transform your visual identity into an unforgettable modern brand."
    },
    {
      id: 5,
      title: "Website Design",
      slug: "website-design",
      description: "Custom UI/UX website designs, luxury layout wireframes, high-end landing pages, and interactive responsive frontend web templates optimized for maximum user conversion.",
      features: JSON.stringify(["UI/UX Interfaces", "Figma Wireframes", "Responsive Frontends", "SEO Optimization"]),
      pricing: "From $2,000",
      featured_image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=600",
      seo_title: "High-End Website Design & UI/UX Services | HA Studio",
      seo_description: "Custom luxury website designs, wireframes, and responsive templates crafted to capture and convert your audience."
    }
  ],
  service_faqs: [
    { id: 1, service_id: 1, question: "What is your standard turnaround for video editing?", answer: "Usually 3 to 7 business days depending on footage length and grade complexity." },
    { id: 2, service_id: 5, question: "Do you design websites in Figma?", answer: "Yes, all website designs begin with a custom, high-fidelity interactive wireframe conceptualized directly in Figma for your feedback and layout review." },
    { id: 3, service_id: 5, question: "Will the finalized website be mobile-responsive?", answer: "Absolutely. Every website layout is styled natively using responsive grids and Tailwind layouts to guarantee seamless rendering across desktops, tablets, and phones." }
  ],
  service_packages: [
    {
      id: 1,
      service_id: 1,
      name: "Starter Cut",
      price: "$1,200",
      badge: "Essential",
      description: "Perfect for single commercial edits, short-form campaigns, or basic promotional clips.",
      features: JSON.stringify(["Up to 5 minutes edited output", "Color Grading included", "Standard sound FX tuning", "2 revision iterations", "Final delivery in web-ready MP4/ProRes"])
    },
    {
      id: 2,
      service_id: 1,
      name: "Brand Cinematic Pack",
      price: "$2,200",
      badge: "Most Popular",
      description: "Advanced rhythm-based sequencing, soundscapes, motion graphic overlay cards, and supreme pacing.",
      features: JSON.stringify(["Up to 15 minutes edited output", "Premium Cinematic color grading", "Sound design & acoustic layering", "Custom basic kinetic title cards", "5 revision iterations"])
    },
    {
      id: 3,
      service_id: 1,
      name: "Creative Retainer",
      price: "$4,500/mo",
      badge: "Elite Partnership",
      description: "Dedicated expert video editor, proactive pacing, continuous digital delivery, and strategic campaign guidance.",
      features: JSON.stringify(["Unlimited short forms (TikToks/Reels)", "Up to 3 high-end commercial cuts", "Dedicated project editor & channels", "Priority turnarounds (under 48h)", "Unlimited revisions & strategy syncs"])
    },
    {
      id: 4,
      service_id: 5,
      name: "Single Creative Landing",
      price: "$2,000",
      badge: "Launch Pad",
      description: "High-level single page web design showcasing a modern concept to capture leads, launch brands, or drive conversions.",
      features: JSON.stringify(["Bespoke Figma UI/UX layout", "Tailwind CSS styled frontend templates", "Fully mobile-responsive screen fitting", "Framer motion page entrance micro-interactions", "Onboarding SEO tags & titles setup"])
    },
    {
      id: 5,
      service_id: 5,
      name: "Premium Multi-Page Brand Suite",
      price: "$4,500",
      badge: "Most Popular",
      description: "A complete custom website layout covering home, about, services, testimonials, and contact features.",
      features: JSON.stringify(["Up to 7 distinct layout designs", "Comprehensive interactive figma wireframe", "Contact messaging & database syncs", "Next-gen dynamic imagery optimizations", "3 revision alignment workshops"])
    },
    {
      id: 6,
      service_id: 5,
      name: "Full-Scale SaaS Platform Design",
      price: "$8,500",
      badge: "Platform Elite",
      description: "Sophisticated multi-tier dashboards, high fidelity interactive user flows, and a cohesive design system.",
      features: JSON.stringify(["UX journey maps & user flow charts", "Interactive user profile pages & analytics panels", "Full custom styled design system export", "Dark & Light style interfaces preset", "Complete layout frontend templates of all screens"])
    },
    {
      id: 7,
      service_id: 2,
      name: "Dynamic Logo Sting",
      price: "$1,500",
      badge: "Essential Motion",
      description: "Animate your existing logomark in a modern, snappy, and memorable motion graphics string to capture attention.",
      features: JSON.stringify(["2 variations of custom logo animation", "High-fidelity professional sound effects layer", "Web and cinema transparent file delivery (MOV/WebM)", "Full 4K resolution rendering", "2 revision iterations"])
    },
    {
      id: 8,
      service_id: 2,
      name: "Premium Explainer Narrative",
      price: "$3,200",
      badge: "Most Popular",
      description: "Complete 1-minute bespoke motion graphic explainer. We bring your story, product, or ideas to life with dynamic icons, characters, and kinetic typography.",
      features: JSON.stringify(["Full scriptwriting helper & boards", "Professional voiceover narration sync", "1 minute custom interactive motion overlay", "Brand-specific palettes and typography rules", "3 feedback cycles included"])
    },
    {
      id: 9,
      service_id: 3,
      name: "Creative Collateral Pack",
      price: "$800",
      badge: "Startup Pack",
      description: "A tailored design package delivering clean, professional, and matching promotional and media designs for your next campaign.",
      features: JSON.stringify(["3 curated social media templates", "2 matching promotional poster/banner layout designs", "Vector graphic custom source files delivered", "Color palette and font matches provided"])
    },
    {
      id: 10,
      service_id: 3,
      name: "Corporate Graphic Suite",
      price: "$1,800",
      badge: "Premium Assets",
      description: "Complete multi-format marketing, business digital stationery, and editorial layouts.",
      features: JSON.stringify(["Full pitch deck and presentation layout template (10-slides)", "Business cards, stationary rules, and print layouts", "Direct access to high-fidelity SVG/PDF final vectors", "Ongoing support and revision options"])
    },
    {
      id: 11,
      service_id: 4,
      name: "Startup Identity Foundation",
      price: "$2,400",
      badge: "Essential Identity",
      description: "Build an authentic, high-impact branding identity matching your core vision and competitive niche.",
      features: JSON.stringify(["2 unique custom vector logomark options", "Cohesive brand color scheme and typography system guidelines", "Basic interactive brand presentation mockup book", "Full ownership transfer documentation"])
    },
    {
      id: 12,
      service_id: 4,
      name: "Master Corporate Brand Book",
      price: "$4,800",
      badge: "Full Brand Relaunch",
      description: "A extensive brand blueprint covering typography hierarchies, physical asset placements, social design guidelines, and printed mockups.",
      features: JSON.stringify(["4 comprehensive concept logomark directions", "Complete brand blueprint rulebook (PDF/Figma structure)", "Digital marketing and stationery asset layouts (Print Ready)", "Social media post templates guidelines (Figma-ready)"])
    }
  ],
  portfolios: [
    {
      id: 1,
      title: "Retro Future Branding Suite",
      category: "Branding Design",
      client_name: "CyberX Labs",
      client_id: 1,
      description: "A dark cyberpunk branding identity combining sharp high-contrast glyphs with glowing cybernetic accents, visual badges, and print assets.",
      challenge: "Transforming complex technical science into a user-friendly cybernetic visual asset system.",
      solution: "Adopted rich neon blues and purples alongside technical monospace typography settings.",
      result: "Boosted product pre-order conversions by 280% on release day.",
      thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      featured_status: 1
    },
    {
      id: 2,
      title: "Aether Cosmetics Launch Video",
      category: "Video Editing",
      client_name: "Aether Cosmetics",
      client_id: 2,
      description: "An elegant, luxurious commercial highlight reels with smooth editorial flow, custom closeups, soft focus pacing, and ambient sound mapping.",
      challenge: "Align organic skincare products with high-fashion, pristine modern pacing under a strict timeline.",
      solution: "Created subtle chromatic transitions combined with acoustic custom background audio.",
      result: "Resulted in a 45% lift in product-page dwell times.",
      thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600",
      video_url: "",
      featured_status: 1
    }
  ],
  portfolio_images: [
    { id: 1, portfolio_id: 1, image_url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600" }
  ],
  blog_categories: [
    { id: 1, name: "Design Trends", slug: "design-trends" },
    { id: 2, name: "Motion & Graphics", slug: "motion-graphics" }
  ],
  blog_posts: [
    {
      id: 1,
      title: "How Motion Design Drives 2026 Web Conversions",
      slug: "how-motion-design-drives-2026",
      content: "Immersive micro-animations are no longer just eye-candy. They direct customer actions, establish visual hierarchies, and bridge critical gaps in attention spans. In this post, we explain how HA Studio applies kinetic visuals to boost sales by over 30%...",
      category: "Motion & Graphics",
      tags: JSON.stringify(["Motion", "Conversion", "UX Design"]),
      featured_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
      seo_title: "Kinetic Layouts & Conversion Optimization",
      seo_description: "A comprehensive analysis on how modern micro-interactions retain web users.",
      publish_status: "published"
    }
  ],
  testimonials: [
    {
      id: 1,
      client_name: "Sarah Jenkins",
      company: "CMO, BrightPath Media",
      rating: 5,
      review: "HA Studio transformed our complex visual guidelines into beautiful modern interactive assets. Their attention to sound pacing, transitions, and general digital detail is stellar.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"
    }
  ],
  contact_messages: [
    { id: 1, name: "Lucas Vance", email: "lucas@example.com", subject: "Visual Makeover", message: "Hey there! We love the HA design style and wanted to enquire about our brand relaunch project.", is_read: 0 }
  ],
  homepage_content: [
    {
      id: 1,
      section_key: "hero",
      section_value: JSON.stringify({
        title: "We craft high-contrast digital experiences",
        subtitle: "HA Studio is a world-class creative agency delivering master-level video editing, motion design, strategic branding, and web development."
      })
    }
  ],
  website_settings: [
    { id: 1, setting_key: "logo", setting_value: "HA Studio" },
    { id: 2, setting_key: "email", setting_value: "contact@hastudio.com" },
    { id: 3, setting_key: "phone", setting_value: "+1 (800) 555-0100" },
    { id: 4, setting_key: "address", setting_value: "Silicon Valley, California" },
    { id: 5, setting_key: "seo_description", setting_value: "Premium high-contrast creative agency specializing in design, film editing, motion graphic animations, and custom development." }
  ],
  media_library: [
    { id: 1, filename: "intro-cinematic.png", file_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600", file_size: 450000, mime_type: "image/png" }
  ]
};

// Internal MySQL Connection Pool
let mysqlPool: mysql.Pool | null = null;

try {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hastudio",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 4000 // Short pool timeout to prevent blocking preview app load
  });
} catch (e) {
  console.log("⚠️ Could not initialize MySQL Pool. Switching directly to simulation mode.");
  useMock = true;
}

export async function initDB() {
  if (useMock || !mysqlPool) {
    console.log("ℹ️ Running in Local Simulation Mode. SQLite-style memory fallback is active.");
    return;
  }
  try {
    const conn = await mysqlPool.getConnection();
    console.log("✅ Successfully connected to MySQL database. Ensuring tables exist...");
    
    // Read and run schema.sql as schema initialization
    try {
      const schemaPath = path.join(process.cwd(), "server", "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        // Remove comments safely line by line
        const cleanLines = schemaSql
          .split("\n")
          .map(line => {
            const idx = line.indexOf("--");
            if (idx !== -1) {
              return line.substring(0, idx);
            }
            return line;
          })
          .map(line => line.trim())
          .filter(Boolean);
        
        const cleanSql = cleanLines.join(" ");
        const queries = cleanSql
          .split(";")
          .map(q => q.trim())
          .filter(q => q.length > 0);
        
        // Disable foreign key checks temporarily during schema verification
        try {
          await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        } catch (fkErr) {
          console.warn("⚠️ Could not disable foreign key checks (non-blocking):", fkErr);
        }

        for (const query of queries) {
          try {
            await conn.query(query);
          } catch (queryErr: any) {
            // Log individual query failures to aid debugging but don't crash everything
            console.warn(`Query warning during schema setup: ${queryErr.message}`);
          }
        }

        try {
          await conn.query("ALTER TABLE services ADD COLUMN display_order INT NOT NULL DEFAULT 0");
        } catch(alterErr: any) {
          // ignore, column might exist
        }

        // Restore foreign key checks
        try {
          await conn.query("SET FOREIGN_KEY_CHECKS = 1");
        } catch (fkErr) {
          console.warn("⚠️ Could not restore foreign key checks (non-blocking):", fkErr);
        }
        console.log("✨ MySQL tables verified and initialized successfully.");
      }
    } catch (schemaErr: any) {
      console.error("⚠️ Failed to initialize schema automatically:", schemaErr.message);
    }

    // Dynamic Seeding of default records from mockDB if tables are empty
    try {
      for (const [tableName, records] of Object.entries(mockDB)) {
        if (!records || records.length === 0) continue;
        
        // Check if table contains rows
        const [rows]: any = await conn.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = rows && rows[0] && rows[0].count;
        if (count === 0) {
          console.log(`🌱 Seeding table ${tableName} with default data...`);
          for (const record of records) {
            const columns = Object.keys(record);
            const values = Object.values(record).map(val => {
              if (typeof val === 'object' && val !== null) {
                return JSON.stringify(val);
              }
              return val;
            });
            const placeholders = columns.map(() => '?').join(', ');
            await conn.query(
              `INSERT IGNORE INTO ${tableName} (\`${columns.join('\`, \`').replace(/id/g, 'id')}\`) VALUES (${placeholders})`,
              values
            );
          }
        }
      }
      console.log("🌱 Database seeding completed successfully!");
    } catch (seedErr: any) {
      console.warn("⚠️ Failed to seed default records (non-blocking):", seedErr.message);
    }

    // Ensure "website-design" service exists in standard DB in case DB was already seeded
    try {
      let [serviceRows]: any = await conn.query("SELECT id FROM services WHERE slug = 'website-design'");
      let serviceId = serviceRows && serviceRows[0] && serviceRows[0].id;

      if (!serviceId) {
        console.log("🌱 Creating missing 'Website Design' service in physical database...");
        const [insertRes]: any = await conn.query(`
          INSERT INTO services (title, slug, description, features, pricing, featured_image, seo_title, seo_description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          "Website Design",
          "website-design",
          "Custom UI/UX website designs, luxury layout wireframes, high-end landing pages, and interactive responsive frontend web templates optimized for maximum user conversion.",
          JSON.stringify(["UI/UX Interfaces", "Figma Wireframes", "Responsive Frontends", "SEO Optimization"]),
          "From $2,000",
          "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=600",
          "High-End Website Design & UI/UX Services | HA Studio",
          "Custom luxury website designs, wireframes, and responsive templates crafted to capture and convert your audience."
        ]);
        serviceId = insertRes.insertId;
      }

      if (serviceId) {
        // Ensure standard FAQs exist for this service
        const [faqRows]: any = await conn.query("SELECT id FROM service_faqs WHERE service_id = ?", [serviceId]);
        if (!faqRows || faqRows.length === 0) {
          console.log(`🌱 Seeding missing FAQ items for service_id ${serviceId} (Website Design)...`);
          await conn.query(`
            INSERT INTO service_faqs (service_id, question, answer) VALUES 
            (?, 'Do you design websites in Figma?', 'Yes, all website designs begin with a custom, high-fidelity interactive wireframe conceptualized directly in figma for your feedback and layout review.'),
            (?, 'Will the finalized website be mobile-responsive?', 'Absolutely. Every website layout is styled natively using responsive grids and Tailwind layouts to guarantee seamless rendering across desktops, tablets, and phones.')
          `, [serviceId, serviceId]);
        }
      }
    } catch (svcErr: any) {
      console.warn("⚠️ Non-blocking warning ensuring Website Design service exists:", svcErr.message);
    }

    conn.release();
    useMock = false;
  } catch (error: any) {
    console.log("⚠️ MySQL Server is offline or config is missing. Simulator Fallback is active.");
    console.log("💡 Tip: Import /server/schema.sql into phpMyAdmin and populate .env with details:", error.message);
    useMock = true;
  }
}

// Emulate simple query syntax: [rows] = await pool.query(sql, params)
export const pool = {
  async query(sql: string, params: any[] = []): Promise<[any, any]> {
    if (!useMock && mysqlPool) {
      try {
        const result = await mysqlPool.query(sql, params);
        return result;
      } catch (err: any) {
        console.warn("⚠️ MySQL query failed, activating simulator fallback:", err.message);
        useMock = true;
      }
    }

    const upperSQL = sql.trim().toUpperCase();
    
    // Simulate table queries cleanly
    // Locate target table NAME
    const fromMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const intoMatch = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
    const updateMatch = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
    
    const tableName = (fromMatch ? fromMatch[1] : (intoMatch ? intoMatch[1] : (updateMatch ? updateMatch[1] : ""))).toLowerCase().trim();
    let records = mockDB[tableName] || [];

    // SELECT QUERY
    if (upperSQL.startsWith("SELECT")) {
      if (sql.includes("COUNT(*)")) {
        return [[{ count: records.length }], null];
      }
      if (sql.includes("WHERE email = ?")) {
        const found = records.find(r => r.email === params[0]);
        return [found ? [found] : [], null];
      }
      if (sql.includes("WHERE slug = ?")) {
        const found = records.find(r => r.slug === params[0]);
        return [found ? [found] : [], null];
      }
      if (sql.includes("WHERE id = ?")) {
        const found = records.find(r => r.id == params[0]);
        return [found ? [found] : [], null];
      }
      if (sql.includes("WHERE service_id = ?")) {
         const matches = (mockDB[tableName] || []).filter(f => f.service_id == params[0]);
         return [matches, null];
      }
      if (sql.includes("WHERE portfolio_id = ?")) {
         const matches = (mockDB["portfolio_images"] || []).filter(img => img.portfolio_id == params[0]);
         return [matches, null];
      }
      
      if (upperSQL.includes("ORDER BY DISPLAY_ORDER ASC")) {
        const sorted = [...records].sort((a, b) => {
          const aOrder = typeof a.display_order === 'number' ? a.display_order : 0;
          const bOrder = typeof b.display_order === 'number' ? b.display_order : 0;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return [sorted, null];
      }

      // Return list
      return [[...records], null];
    }

    // INSERT QUERY
    if (upperSQL.startsWith("INSERT")) {
      if (tableName) {
        if (tableName === "website_settings") {
          const keyParam = params[0];
          const valParam = params[1];
          const existing = records.find(r => r.setting_key === keyParam);
          if (existing) {
            existing.setting_value = valParam || "";
            return [{ affectedRows: 1 }, null];
          }
        }

        const newId = records.length + 1;
        let newRecord: any = { id: newId, created_at: new Date().toISOString() };
        
        const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
        if (colsMatch && colsMatch[1]) {
          const cols = colsMatch[1].split(",").map(c => c.trim().replace(/`/g, ''));
          cols.forEach((col, idx) => {
            newRecord[col] = params[idx];
          });
        }
        records.push(newRecord);
        mockDB[tableName] = records;
        return [{ insertId: newId, affectedRows: 1 }, null];
      }
    }

    // UPDATE QUERY
    if (upperSQL.startsWith("UPDATE")) {
      if (tableName) {
        const id = params[params.length - 1];
        const record = records.find(r => r.id == id);
        if (record) {
          const setMatch = sql.match(/SET\s+([^WHERE]+)/i);
          if (setMatch && setMatch[1]) {
             const keyPairs = setMatch[1].split(",");
             keyPairs.forEach((pair, idx) => {
                const key = pair.split("=")[0].trim().replace(/`/g, '');
                if (params[idx] !== undefined) {
                   record[key] = params[idx];
                }
             });
          }
        }
        return [{ affectedRows: 1 }, null];
      }
    }

    // DELETE QUERY
    if (upperSQL.startsWith("DELETE")) {
      console.log("[MockDB DELETE] Execution:", sql, "extracted tableName:", tableName, "params:", params);
      if (tableName) {
        const id = params[0];
        const prevCount = records.length;
        mockDB[tableName] = records.filter(r => r.id != id && String(r.id) !== String(id));
        console.log("[MockDB DELETE] Filtered complete. Previous count:", prevCount, "New count:", mockDB[tableName].length, "Target ID:", id);
        return [{ affectedRows: 1 }, null];
      }
    }

    return [[], null];
  }
};

export function getDatabaseStatus() {
  return {
    isMocked: useMock,
    config: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      database: process.env.DB_NAME || "hastudio"
    }
  };
}
