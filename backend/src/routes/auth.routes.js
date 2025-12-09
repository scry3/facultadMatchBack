const express = require("express");
const router = express.Router();

const requireAuth = require('../middlewares/authMiddleware');

const { registerUser, loginUser, getAllUsers, updateProfile, getProfile } = require("../controllers/auth.controller");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/users
router.get("/users", requireAuth, getAllUsers);

// PATCH /api/auth/profile
router.patch("/profile", requireAuth, updateProfile);

// routes/auth.routes.js
router.get("/profile", requireAuth, getProfile);


module.exports = router;

