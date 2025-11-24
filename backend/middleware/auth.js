const admin = require("../firebaseAdmin");

module.exports = async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = header.split(" ")[1];

  try {
    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // Get user role from Firestore
    const db = admin.firestore();
    const snap = await db.collection("User").doc(decoded.uid).get();

    let role = "pending";
    if (snap.exists) {
      role = snap.data().Role || "pending";
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
