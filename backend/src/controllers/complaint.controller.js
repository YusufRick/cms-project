
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
 Retrieve complaints submitted by email
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
Retrieve all complaints within their organisation only
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
 Retrieve a complaint by Id
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
 Consumer submits a complaint
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
      consumer_email: email,
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
 * Agent logs a complaint on behalf of customer through phone call
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
      consumer_email: email,
      created_by: agentId,
      source: "agent",
      logged_by: agentId,

      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // store user id fi email exists in Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(email);
      payload.user_id = userRecord.uid;
    } catch (_) {

    }

    const id = await createComplaint(orgType, payload);
    return res.status(201).json({ id });
  } catch (err) {
    console.error("submitComplaintByAgent error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Updating a complaint
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
 * delete complaint
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
 *Assigning a support engineer to a complaint
 Only one support engineer can be assigned to a single complaint.
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
 * add a solution to the complaint and display the helpdesk agent responsible for it.

 */
export const addSolutionController = async (req, res) => {
  try {
    const orgType = req.user.organizationType;
    const agentUid = req.user.uid;
    const agentEmail = String(req.user.email || "").trim().toLowerCase();
    const { id } = req.params;

    const { solution_text, markResolved, status } = req.body;

    if (!solution_text || !String(solution_text).trim()) {
      return res.status(400).json({ error: "solution_text is required" });
    }

    // optional agent name from Firestore
    let agentName = "";
    try {
      const agentDoc = await db.collection("User").doc(agentUid).get();
      if (agentDoc.exists) {
        const data = agentDoc.data();
        agentName =
          data?.Name ||
          data?.FullName ||
          data?.displayName ||
          "";
      }
    } catch (_) {}

    // deciding the status of a complaitn after adding solution
    const finalStatus =
      status || (markResolved ? "resolved" : "in-progress");

    const payload = {
      solution: {
        text: String(solution_text).trim(),
        agent_uid: agentUid,
        agent_email: agentEmail,
        agent_name: agentName || agentEmail || "Agent",
        createdAt: new Date(),
      },
      status: finalStatus,
      updatedAt: new Date(),
      ...(finalStatus === "resolved" ? { resolvedAt: new Date() } : {}),
    };

    await updateComplaint(orgType, id, payload);

    return res.json({
      message: "Solution saved",
      complaintId: id,
      status: finalStatus,
    });
  } catch (err) {
    console.error("addSolutionController error:", err);
    return res.status(500).json({ error: err.message });
  }
};

