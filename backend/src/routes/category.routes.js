// src/routes/category.routes.js
import express from "express";
import {
  listCategories,
  addCategory,
  editCategory,
  removeCategory,
} from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// list categories
router.get("/", authMiddleware, listCategories);

// create category
router.post("/", authMiddleware, addCategory);

// update category
router.patch("/:id", authMiddleware, editCategory);

// delete category
router.delete("/:id", authMiddleware, removeCategory);

export default router;
