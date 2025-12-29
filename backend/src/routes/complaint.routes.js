// src/routes/complaint.routes.js
import express from "express";
import {
  fetchUserComplaints,
  fetchAllComplaints,
  fetchComplaintById,
  submitComplaint,
  updateComplaintController,
  deleteComplaintController,
  submitComplaintByAgent,
  addSolutionController,        
  assignSupportController,      
} from "../controllers/complaint.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.patch("/:id/solution", authMiddleware, addSolutionController);
router.patch("/:id/assign", authMiddleware, assignSupportController);

// helpdesk agent: log complaint on behalf of consumer
router.post("/agent", authMiddleware, submitComplaintByAgent);

// user: list own complaints
router.get("/", authMiddleware, fetchUserComplaints);

// staff/admin: list all complaints
router.get("/all", authMiddleware, fetchAllComplaints);

// get single complaint
router.get("/:id", authMiddleware, fetchComplaintById);

// create complaint
router.post("/", authMiddleware, submitComplaint);

// update complaint
router.patch("/:id", authMiddleware, updateComplaintController);

// delete complaint
router.delete("/:id", authMiddleware, deleteComplaintController);

export default router;
