const complaintService = require('../services/complaint.service');

async function createComplaint(req, res) {
  try {
    const { orgId } = req.params;
    const newComplaint = await complaintService.createComplaint(orgId, req.body);
    res.status(201).json(newComplaint);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create complaint' });
  }
}

async function getComplaints(req, res) {
  try {
    const complaints = await complaintService.getComplaints(req.params.orgId);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
}

module.exports = {
  createComplaint,
  getComplaints,
};
