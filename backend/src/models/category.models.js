// src/models/category.model.js
import { db } from "../../firebaseAdmin.js";
import { ORG_COLLECTIONS } from "../config/org_collection.js";

const categoryCollection = (orgType) => {
  const config = ORG_COLLECTIONS[orgType];
  const collectionName = config?.categories || `${orgType}_categories`;
  return db.collection(collectionName);
};

export const getCategories = async (orgType) => {
  try {
    const snapshot = await categoryCollection(orgType).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("getCategories error:", err);
    throw err;
  }
};

export const createCategory = async (orgType, data) => {
  try {
    const now = new Date();

    const docRef = await categoryCollection(orgType).add({
      createdAt: now,
      updatedAt: now,
      ...data, // expected: { name, description, isActive }
    });

    return docRef.id;
  } catch (err) {
    console.error("createCategory error:", err);
    throw err;
  }
};

export const updateCategory = async (orgType, id, data) => {
  try {
    const docRef = categoryCollection(orgType).doc(id);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    throw err;
  }
};

export const deleteCategory = async (orgType, id) => {
  try {
    const docRef = categoryCollection(orgType).doc(id);
    await docRef.delete();
  } catch (err) {
    console.error("deleteCategory error:", err);
    throw err;
  }
};
