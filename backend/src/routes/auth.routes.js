const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getAllUsers} = require("../controllers/auth.controller");
const { likeUser } = require("../controllers/likes.controller");
const { getMatches } = require("../controllers/match.controller");

// Endpoint POST /api/register
router.post("/register", registerUser);

// Endpoint POST /api/login
router.post("/login", loginUser);

// Endpoint GET /api/users
router.get("/users", getAllUsers);

// Endpoint POST /api/like/:id → dar like a otro usuario
router.post("/like/:id", likeUser);

// Endpoint GET /api/matches → traer los matches del usuario
router.get("/matches", getMatches);

module.exports = router;
