// src/routes/category.routes.js
import express from "express";
import {
  listCategories,
  addCategory,

} from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// list categories
router.get("/", authMiddleware, listCategories);

// create category
router.post("/", authMiddleware, addCategory);



export default router;
