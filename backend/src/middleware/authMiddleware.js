// src/middleware/authMiddleware.js
import { auth, db } from "../../firebaseAdmin.js";
import { ORG_COLLECTIONS } from "../config/orgCollections.js";

// Optional helper: normalise org names to your mapping keys
const normaliseOrgType = (org) => {
  if (!org) return org;
  const trimmed = String(org).trim();

  // If it already matches exactly, keep it
  if (ORG_COLLECTIONS[trimmed]) return trimmed;

  // Try case-insensitive match
  const foundKey = Object.keys(ORG_COLLECTIONS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );

  return foundKey || trimmed;
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Let preflight through
    if (req.method === "OPTIONS") return next();

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const idToken = header.split(" ")[1];

    // Decode Firebase ID token
    const decoded = await auth.verifyIdToken(idToken);

    // 1) Try claims / header (least reliable)
    let organizationType =
      decoded.organizationType ||
      decoded.orgType ||
      req.headers["x-org-type"];

    organizationType = normaliseOrgType(organizationType);

    // 2) Firestore user doc (best source)
    let role = decoded.role || decoded.userRole || null;

    const userDoc = await db.collection("User").doc(decoded.uid).get();
    if (userDoc.exists) {
      const data = userDoc.data();

      if (data?.Company) {
        organizationType = normaliseOrgType(data.Company);
      }
      if (data?.Role) {
        role = data.Role;
      }
    }

    if (!organizationType) {
      return res.status(400).json({
        error: "No organization type found for this user",
      });
    }

    // ✅ Enforce org must exist in ORG_COLLECTIONS
    if (!ORG_COLLECTIONS[organizationType]) {
      return res.status(400).json({
        error: `Unsupported organisation type: ${organizationType}`,
      });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      organizationType,
      role, // ✅ useful for RBAC checks later
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
