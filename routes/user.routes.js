const express = require("express");
const router = express.Router();
const sourceController = require("../controller/source.controller");

// POST запрос на создание нового источника
router.post("/", sourceController.createSource);

// GET запрос на получение списка источников
router.get("/", sourceController.getSource);

// GET запрос на получение одного источника по id
router.get("/:id", sourceController.getOneSource);

// PUT запрос на обновление данных источника по id
router.put("/:id", sourceController.updateSource);

// DELETE запрос на удаление источника по id
router.delete("/:id", sourceController.deleteSource);

module.exports = router;
