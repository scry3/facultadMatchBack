const express = require("express");
const router = express.Router();

const { getMatches } = require("../controllers/match.controller");
const requireAuth = require("../middlewares/authMiddleware");

// GET /api/match
router.get("/", requireAuth, getMatches);

module.exports = router;
