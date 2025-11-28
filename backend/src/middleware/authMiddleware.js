// src/middleware/authMiddleware.js
import { auth } from "../../firebaseAdmin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // 🚨 Let preflight pass through with no auth check
    if (req.method === "OPTIONS") {
      return next();
    }

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const idToken = header.split(" ")[1];

    const decoded = await auth.verifyIdToken(idToken);

    const organizationType =
      decoded.organizationType ||
      decoded.orgType ||
      req.headers["x-org-type"] ||
      "default_org";

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
