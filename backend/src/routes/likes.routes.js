// routes/likes.routes.js
const express = require("express");
const router = express.Router();

const { likeUser } = require("../controllers/likes.controller");
const requireAuth = require("../middlewares/authMiddleware");

// LIKE A UN USUARIO
router.post("/:id", requireAuth, likeUser);

module.exports = router;
