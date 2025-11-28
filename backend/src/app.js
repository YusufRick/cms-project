import express from "express";
import cors from "cors";

import categoryRoutes from "./routes/category.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/categories", verifyToken, categoryRoutes);
app.use("/api/complaints", verifyToken, complaintRoutes);

export default app;
