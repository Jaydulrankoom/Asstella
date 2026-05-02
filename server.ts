import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import assetRoutes from "./server/routes/assetRoutes";
import financeRoutes from "./server/routes/financeRoutes";
import dashboardRoutes from "./server/routes/dashboardRoutes";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // For local dev / iframe compatibility
  }));
  app.use(morgan("dev"));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AssetsFlow API is running" });
  });
  app.use("/api/assets", assetRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
