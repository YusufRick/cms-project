
import {
  getCategories,
  
} from "../models/category.models.js";

// GET categories from firestore
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





