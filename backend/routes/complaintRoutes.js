const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/complaints
router.get('/', authenticate, complaintController.getAllComplaints);

// GET /api/complaints/:id
router.get('/:id', authenticate, complaintController.getComplaintById);

// POST /api/complaints
router.post('/', authenticate, complaintController.createComplaint);

// PATCH /api/complaints/:id/status
router.patch(
  '/:id/status',
  authenticate,
  authorize('helpdesk', 'support', 'admin'),
  complaintController.updateComplaintStatus
);

// DELETE /api/complaints/:id
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  complaintController.deleteComplaint
);

module.exports = router;
