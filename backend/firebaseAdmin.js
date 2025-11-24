const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); 
// Download from Firebase Console → Project Settings → Service Accounts

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
