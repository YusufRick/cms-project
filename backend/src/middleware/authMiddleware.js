import { auth, db } from "../../firebaseAdmin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Let preflight through
    if (req.method === "OPTIONS") {
      return next();
    }

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const idToken = header.split(" ")[1];

    // Decode Firebase ID token
    const decoded = await auth.verifyIdToken(idToken);

    let organizationType =
      decoded.organizationType || // custom claims, if you ever add them
      decoded.orgType ||
      req.headers["x-org-type"]; // optional header from frontend

    // 🔍 If we still don't know org, lookup from Firestore "User" doc
    if (!organizationType) {
      const userDoc = await db.collection("User").doc(decoded.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        organizationType = data.Company; // 👈 field name from your screenshot
      }
    }

    // As a last resort, you can either reject or set a default.
    if (!organizationType) {
      return res.status(400).json({
        error: "No organization type found for this user",
      });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      organizationType,
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
