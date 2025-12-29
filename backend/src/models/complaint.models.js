// src/models/complaint.models.js
import { db } from "../../firebaseAdmin.js";
import { ORG_COLLECTIONS } from "../config/org_collection.js";

const complaintCollection = (orgType) => {
  const orgConfig = ORG_COLLECTIONS[orgType];
  if (!orgConfig || !orgConfig.complaints) {
    throw new Error(`No complaints collection configured for orgType: ${orgType}`);
  }
  return db.collection(orgConfig.complaints);
};

const toMillisSafe = (v) => {
  if (!v) return 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  if (v?._seconds) return v._seconds * 1000;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
};

/**
 * Consumer: get own complaints by consumer_email
 * (Your controller passes email)
 */
export const getComplaints = async (orgType, consumerEmail) => {
  try {
    const email = String(consumerEmail || "").trim().toLowerCase();
    if (!email) return [];

    const snapshot = await complaintCollection(orgType)
      .where("consumer_email", "==", email)
      .get();

    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    complaints.sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt));
    return complaints;
  } catch (err) {
    console.error("getComplaints error:", err);
    throw err;
  }
};

export const getAllComplaints = async (orgType) => {
  try {
    const snapshot = await complaintCollection(orgType)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("getAllComplaints error:", err);
    throw err;
  }
};

export const getComplaintById = async (orgType, id) => {
  try {
    const docSnap = await complaintCollection(orgType).doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error("getComplaintById error:", err);
    throw err;
  }
};

export const createComplaint = async (orgType, data) => {
  try {
    const now = new Date();

    const docRef = await complaintCollection(orgType).add({
      status: "pending",
      createdAt: now,
      updatedAt: now,
      ...data,
    });

    return docRef.id;
  } catch (err) {
    console.error("createComplaint error:", err);
    throw err;
  }
};

export const updateComplaint = async (orgType, id, data) => {
  try {
    await complaintCollection(orgType).doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("updateComplaint error:", err);
    throw err;
  }
};

export const deleteComplaint = async (orgType, id) => {
  try {
    await complaintCollection(orgType).doc(id).delete();
  } catch (err) {
    console.error("deleteComplaint error:", err);
    throw err;
  }
};
