// src/controllers/complaint.controller.js
import {
  getComplaints,
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from "../models/complaint.models.js";

import { auth, db } from "../../firebaseAdmin.js";

/**
 * GET /api/complaints
 * Consumer: list own complaints (email-based)
 */
export const fetchUserComplaints = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const email = String(req.user.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const complaints = await getComplaints(orgType, email);
    return res.json(complaints);
  } catch (err) {
    console.error("fetchUserComplaints error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/complaints/all
 * Staff/Agent/Admin: list all complaints in org
 */
export const fetchAllComplaints = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const complaints = await getAllComplaints(orgType);
    return res.json(complaints);
  } catch (err) {
    console.error("fetchAllComplaints error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/complaints/:id
 */
export const fetchComplaintById = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    const complaint = await getComplaintById(orgType, id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    return res.json(complaint);
  } catch (err) {
    console.error("fetchComplaintById error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/complaints
 * Consumer submits for self
 */
export const submitComplaint = async (req, res) => {
  try {
    const orgType = req.user.organizationType;

    const createdBy = req.user.uid;
    const email = String(req.user.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "User email not found in token" });

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

      // ✅ audit
      created_by: createdBy,
      source: "self",

      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaint error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/complaints/agent
 * Agent logs on behalf of consumer
 */
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

      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optional: store uid if found (useful later, not required)
    try {
      const userRecord = await auth.getUserByEmail(email);
      payload.user_id = userRecord.uid;
    } catch (_) {
      // user not found — keep consumer_email only
    }

    const id = await createComplaint(orgType, payload);
    return res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaintByAgent error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/complaints/:id
 * Generic update (status etc.)
 */
export const updateComplaintController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    await updateComplaint(orgType, id, { ...req.body, updatedAt: new Date() });
    return res.json({ message: "Complaint updated" });
  } catch (err) {
    console.error("updateComplaintController error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/complaints/:id
 */
export const deleteComplaintController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const { id } = req.params;

    await deleteComplaint(orgType, id);
    return res.json({ message: "Complaint deleted" });
  } catch (err) {
    console.error("deleteComplaintController error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/complaints/:id/assign
 * Assign a support person by email
 */
export const assignSupportController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const assignedByUid = req.user.uid;
    const { id } = req.params;

    const { support_email } = req.body;
    if (!support_email || !String(support_email).trim()) {
      return res.status(400).json({ error: "support_email is required" });
    }

    const email = String(support_email).trim().toLowerCase();

    // must exist in Firebase Auth
    const record = await auth.getUserByEmail(email);
    const supportUid = record.uid;

    // optional display name from Firestore
    let supportName = "";
    try {
      const supportDoc = await db.collection("User").doc(supportUid).get();
      if (supportDoc.exists) {
        const data = supportDoc.data();
        supportName = data?.Name || data?.FullName || data?.displayName || "";
      }
    } catch (_) {}

    const payload = {
      support: {
        uid: supportUid,
        email,
        name: supportName || email,
        assignedAt: new Date(),
        assignedBy_uid: assignedByUid,
      },
      status: "in-progress",
      updatedAt: new Date(),
    };

    await updateComplaint(orgType, id, payload);
    return res.json({ message: "Support assigned", complaintId: id });
  } catch (err) {
    console.error("assignSupportController error:", err);
    if (String(err?.message || "").includes("auth/user-not-found")) {
      return res.status(404).json({ error: "Support user not found in Auth" });
    }
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/complaints/:id/solution
 * Add solution + agent identity so consumer dashboard can display it
 *
 * Body: { solution_text: string, markResolved?: boolean }
 */
export const addSolutionController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const agentUid = req.user.uid;
    const agentEmail = String(req.user.email || "").trim().toLowerCase();
    const { id } = req.params;

    const { solution_text, markResolved } = req.body;

    if (!solution_text || !String(solution_text).trim()) {
      return res.status(400).json({ error: "solution_text is required" });
    }

    // optional agent name from Firestore
    let agentName = "";
    try {
      const agentDoc = await db.collection("User").doc(agentUid).get();
      if (agentDoc.exists) {
        const data = agentDoc.data();
        agentName = data?.Name || data?.FullName || data?.displayName || "";
      }
    } catch (_) {}

    const payload = {
      solution: {
        text: String(solution_text).trim(),
        agent_uid: agentUid,
        agent_email: agentEmail,
        agent_name: agentName || agentEmail || "Agent",
        createdAt: new Date(),
      },
      status: markResolved ? "resolved" : "in-progress",
      updatedAt: new Date(),
      ...(markResolved ? { resolvedAt: new Date() } : {}),
    };

    await updateComplaint(orgType, id, payload);
    return res.json({ message: "Solution saved", complaintId: id });
  } catch (err) {
    console.error("addSolutionController error:", err);
    return res.status(500).json({ error: err.message });
  }
};
