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


export const getComplaints = async (orgType, userId) => {
  try {
    // check against userID
    const snapshot = await complaintCollection(orgType)
      .where("user_id", "==", userId)
      .get();

    // map to a plain object
    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3) Sort in memory by createdAt DESC
    complaints.sort((a, b) => {
      const ta = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : new Date(a.createdAt || 0).getTime();
      const tb = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : new Date(b.createdAt || 0).getTime();

      return tb - ta; // newest first
    });

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
    const docRef = complaintCollection(orgType).doc(id);
    const docSnap = await docRef.get();

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
    const docRef = complaintCollection(orgType).doc(id);
    await docRef.update({
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
    const docRef = complaintCollection(orgType).doc(id);
    await docRef.delete();
  } catch (err) {
    console.error("deleteComplaint error:", err);
    throw err;
  }
};
