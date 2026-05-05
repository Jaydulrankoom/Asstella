import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load the fully-configured backend app from src/app.js
import backendApp from "./src/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Root health check for platform
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Mount the entire backend API
  app.use(backendApp);

  // Serve static files (prefer dist if exists)
  const distPath = path.join(__dirname, "dist");
  if (fs.existsSync(distPath)) {
    console.log("Serving static from dist...");
    app.use(express.static(distPath));
  }

  // Vite middleware for development (fallback)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // SPA Fallback
  app.get("*", (req, res) => {
    if (fs.existsSync(path.join(distPath, "index.html"))) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).send("Not found and no static build available.");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
