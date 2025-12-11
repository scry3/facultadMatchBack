const express = require("express");
const router = express.Router();

const { getMatches } = require("../controllers/match.controller");
const authJwt = require("../middlewares/authJwt"); // <--- cambiamos middleware

// GET /api/match
router.get("/", authJwt, getMatches);

module.exports = router;
