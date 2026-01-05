
import { db } from "../../firebaseAdmin.js";
import { ORG_COLLECTIONS } from "../config/org_collection.js";


//category based on organisation type
const categoryCollection = (orgType) => {
  const config = ORG_COLLECTIONS[orgType];
  const collectionName = config?.categories || `${orgType}_categories`;
  return db.collection(collectionName);
};


// CRUD operation for category
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



