// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import categoryRoutes from "./src/routes/category.routes.js";
import complaintRoutes from "./src/routes/complaint.routes.js";

dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// 1) Global CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ❌ IMPORTANT: remove ALL app.options(...) lines
// (Express 5 + path-to-regexp v6 doesn't like '*' wildcards in paths)

// 2) Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CMS backend is running" });
});

// 4) Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/complaints", complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
