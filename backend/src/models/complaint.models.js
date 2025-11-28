// src/models/complaint.models.js
import { db } from "../../firebaseAdmin.js"; // 🔧 adjust path if needed

// Helper to get the collection for a given organization type
const complaintCollection = (orgType) =>
  db.collection(`${orgType}_complaints`); // e.g. "hospital_complaints", "bank_complaints"

export const getComplaints = async (orgType, userId) => {
  try {
    let ref = complaintCollection(orgType).where("user_id", "==", userId);

    const snapshot = await ref.orderBy("createdAt", "desc").get();
    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
      status: "open",
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
