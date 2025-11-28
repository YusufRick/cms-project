// src/controllers/complaint.controller.js
import {
  getComplaints,
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from "../models/complaint.models.js";

// GET /api/complaints  (user-specific)
export const fetchUserComplaints = async (req, res) => {
  try {
    const orgType = req.user.organizationType;  // from auth middleware
    const userId = req.user.uid;

    const complaints = await getComplaints(orgType, userId);
    res.json(complaints);
  } catch (err) {
    console.error("fetchUserComplaints error:", err);
    res.status(500).json({ error: err.message });
  }
};

// (optional) GET /api/complaints/all  – staff/admin view
export const fetchAllComplaints = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const complaints = await getAllComplaints(orgType);
    res.json(complaints);
  } catch (err) {
    console.error("fetchAllComplaints error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/complaints/:id
export const fetchComplaintById = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    const complaint = await getComplaintById(orgType, id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    console.error("fetchComplaintById error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/complaints
export const submitComplaint = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const userId = req.user.uid;

    const { category_id, description, attachment } = req.body;

    if (!category_id || !description) {
      return res
        .status(400)
        .json({ error: "category_id and description are required" });
    }

    const id = await createComplaint(orgType, {
      category_id,
      description,
      attachment: attachment || "",
      user_id: userId,
    });

    res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaint error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/complaints/:id
export const updateComplaintController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;
    const data = req.body; // e.g. { status: "in_progress" }

    await updateComplaint(orgType, id, data);
    res.json({ message: "Complaint updated" });
  } catch (err) {
    console.error("updateComplaintController error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/complaints/:id
export const deleteComplaintController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    await deleteComplaint(orgType, id);
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    console.error("deleteComplaintController error:", err);
    res.status(500).json({ error: err.message });
  }
};
