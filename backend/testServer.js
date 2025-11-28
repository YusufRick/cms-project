// backend/testServer.js
import express from "express";
import cors from "cors";

const app = express();

// 🔹 CORS for Vite frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ❌ IMPORTANT: no app.options(...) at all

app.use(express.json());

// Simple test endpoints WITHOUT auth / Firebase
app.get("/api/categories", (req, res) => {
  console.log("GET /api/categories");
  res.json([
    { id: "cat-1", title: "Test Category 1" },
    { id: "cat-2", title: "Test Category 2" },
  ]);
});

app.get("/api/complaints", (req, res) => {
  console.log("GET /api/complaints");
  res.json([]);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`TEST server running at http://localhost:${PORT}`);
});
