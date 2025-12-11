// routes/likes.routes.js
const express = require("express");
const router = express.Router();

const { likeUser } = require("../controllers/likes.controller");
const authJwt = require("../middlewares/authJwt");

// LIKE A UN USUARIO
router.post("/:id", authJwt, likeUser);

module.exports = router;
