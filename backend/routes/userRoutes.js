const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");

router.get("/me", authenticate, (req, res) => {
  res.json({
    message: "User authenticated",
    user: req.user,
  });
});

module.exports = router;
