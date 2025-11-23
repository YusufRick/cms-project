const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

// GET /api/users/:id
router.get('/:id', authenticate, userController.getUserById);

// PUT /api/users/:id
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;
