const express = require('express');
const {
  createComplaint,
  getComplaints
} = require('../controllers/complaint.controller');

const router = express.Router();

router.post('/:orgId', createComplaint);
router.get('/:orgId', getComplaints);

module.exports = router;
