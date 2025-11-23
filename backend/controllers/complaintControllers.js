const Complaint = require('../models/Complaint');

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, createdBy } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (createdBy) filters.createdBy = createdBy;

    const complaints = await Complaint.findAll(filters);
    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, description, attachmentUrl } = req.body;
    const createdBy = req.user.id;

    const complaint = await Complaint.create({
      category,
      description,
      createdBy,
      attachmentUrl,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const resolvedBy = status === 'resolved' ? req.user.id : null;

    const complaint = await Complaint.updateStatus(id, status, resolvedBy);
    
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Complaint.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
