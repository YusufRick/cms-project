
import { auth, db } from "../../firebaseAdmin.js";
import { ORG_COLLECTIONS } from "../config/org_collection.js";

//normalise by trimming and case-insensitive matching
const normaliseOrgType = (org) => {
  if (!org) return org;
  const trimmed = String(org).trim();

  // check organisation exists
  if (ORG_COLLECTIONS[trimmed]) return trimmed;

  // try case-insensitive match
  const foundKey = Object.keys(ORG_COLLECTIONS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );

  return foundKey || trimmed;
};

export const authMiddleware = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") return next();

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const idToken = header.split(" ")[1];

    // Firebase JWT token verification
    const decoded = await auth.verifyIdToken(idToken);

 
    let organizationType =
      decoded.organizationType ||
      decoded.orgType ||
      req.headers["x-org-type"];

    organizationType = normaliseOrgType(organizationType);

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

    //Role based control system
    if (!ORG_COLLECTIONS[organizationType]) {
      return res.status(400).json({
        error: `Unsupported organisation type: ${organizationType}`,
      });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      organizationType,
      role, 
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
