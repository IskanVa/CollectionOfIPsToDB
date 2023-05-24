const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

// POST запрос на регистрацию нового пользователя
router.post("/register", authController.register);

// POST запрос на аутентификацию пользователя
router.post("/login", authController.login);

module.exports = router;
