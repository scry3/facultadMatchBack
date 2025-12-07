const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/auth.controller");

// Endpoint POST /api/register
router.post("/register", registerUser);

// Endpoint POST /api/login
router.post("/login", loginUser);

module.exports = router;
