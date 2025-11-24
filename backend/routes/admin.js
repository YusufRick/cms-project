const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const adminController = require("../controllers/adminController");

// Only admins can access these routes
router.get(
  "/dashboard",
  authenticate,
  requireRole("admin"),
  adminController.getDashboard
);

module.exports = router;
