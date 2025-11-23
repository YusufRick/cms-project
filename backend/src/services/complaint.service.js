const { db } = require('../firebase/firebaseAdmin');

const collectionForOrg = (orgId) =>
  db.collection('orgs').doc(orgId).collection('complaints');

async function createComplaint(orgId, data) {
  const now = new Date();
  const payload = {
    title: data.title,
    description: data.description,
    type: data.type || 'general',
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };

  const ref = await collectionForOrg(orgId).add(payload);
  return { id: ref.id, ...payload };
}

async function getComplaints(orgId) {
  const snapshot = await collectionForOrg(orgId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  createComplaint,
  getComplaints,
};

