import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import categoryRoutes from "./src/routes/category.routes.js";
import complaintRoutes from "./src/routes/complaint.routes.js";

dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CMS backend is running" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/complaints", complaintRoutes);

const PORT = process.env.PORT || 4000; // 👈 CHANGED HERE

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
