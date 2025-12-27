// src/controllers/complaint.controller.js
import {
  getComplaints,
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from "../models/complaint.models.js";

import { auth } from "../../firebaseAdmin.js";

// GET /api/complaints  (consumer: own complaints)
export const fetchUserComplaints = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const email = String(req.user.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // ✅ email-based lookup
    const complaints = await getComplaints(orgType, email);
    res.json(complaints);
  } catch (err) {
    console.error("fetchUserComplaints error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/complaints/all (staff/agent/admin: all complaints in org)
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

// POST /api/complaints  (consumer submits for self)
export const submitComplaint = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const createdBy = req.user.uid;

    const email = String(req.user.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const { title, category_id, description, attachment } = req.body;

    if (!title || !category_id || !description) {
      return res.status(400).json({
        error: "title, category_id and description are required",
      });
    }

    const id = await createComplaint(orgType, {
      title: String(title).trim(),
      category_id,
      description: String(description).trim(),
      attachment: attachment || "",

      // ✅ normalized identity
      consumer_email: email,

      // ✅ audit fields (optional but recommended)
      created_by: createdBy,
      source: "self",
    });

    res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaint error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/complaints/agent  (agent logs on behalf of consumer)
export const submitComplaintByAgent = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const agentId = req.user.uid;

    const { consumer_email, title, category_id, description, attachment } = req.body;

    if (!consumer_email || !category_id || !description) {
      return res.status(400).json({
        error: "consumer_email, category_id and description are required",
      });
    }

    const email = String(consumer_email).trim().toLowerCase();

    const safeTitle =
      typeof title === "string" && title.trim()
        ? title.trim()
        : `Phone complaint from ${email}`;

    const safeDescription = String(description || "").trim();

    const payload = {
      title: safeTitle,
      category_id,
      description: safeDescription,
      attachment: attachment || "",

      // ✅ normalized identity
      consumer_email: email,

      // ✅ audit
      created_by: agentId,
      source: "agent",
      logged_by: agentId,
    };

    // Optional: store uid if found (doesn't affect email-only queries)
    try {
      const userRecord = await auth.getUserByEmail(email);
      payload.user_id = userRecord.uid;
    } catch (e) {
      // user not found — keep consumer_email only
    }

    const id = await createComplaint(orgType, payload);
    res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaintByAgent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/complaints/:id
export const updateComplaintController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    await updateComplaint(orgType, id, req.body);
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
