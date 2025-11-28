// src/controllers/category.controller.js
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../models/category.models.js";

// GET /api/categories
export const listCategories = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const categories = await getCategories(orgType);
    res.json(categories);
  } catch (err) {
    console.error("listCategories error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/categories
export const addCategory = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const id = await createCategory(orgType, {
      name,
      description: description || "",
      isActive: isActive ?? true,
    });

    res.status(201).json({ id });
  } catch (err) {
    console.error("addCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/categories/:id
export const editCategory = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;
    const data = req.body;

    await updateCategory(orgType, id, data);
    res.json({ message: "Category updated" });
  } catch (err) {
    console.error("editCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/categories/:id
export const removeCategory = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    await deleteCategory(orgType, id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("removeCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};
