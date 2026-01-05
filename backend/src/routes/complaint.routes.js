
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

// helpdesk agent logs a complaint on behalf of consumer
router.post("/agent", authMiddleware, submitComplaintByAgent);

// Consumer retreieves own complaints
router.get("/", authMiddleware, fetchUserComplaints);

// agent retrieves all complaints within organisation
router.get("/all", authMiddleware, fetchAllComplaints);

// agent get a single complaint using a search engine (optional)
router.get("/:id", authMiddleware, fetchComplaintById);

// creating a complaint
router.post("/", authMiddleware, submitComplaint);

// update complaint
router.patch("/:id", authMiddleware, updateComplaintController);

// delete complaint
router.delete("/:id", authMiddleware, deleteComplaintController);

export default router;
