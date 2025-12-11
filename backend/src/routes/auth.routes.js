const express = require("express");
const router = express.Router();

const authJwt = require('../middlewares/authJwt');
const { registerUser, loginUser, getAllUsers, updateProfile, getProfile } = require("../controllers/auth.controller");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/users
router.get("/users", authJwt, getAllUsers);

// PATCH /api/auth/profile
router.patch("/profile", authJwt, updateProfile);

// GET /api/auth/profile
router.get("/profile", authJwt, getProfile);

module.exports = router;
