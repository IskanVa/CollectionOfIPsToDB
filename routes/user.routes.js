const express = require("express");
const router = express.Router();
const sourceController = require("../controller/source.controller");

// POST запрос на создание нового источника
router.post("/sources", sourceController.createSource);

// POST запрос на создание нового источника
router.post("/teams", sourceController.createTeam);

// GET запрос на получение списка источников
router.get("/sources", sourceController.getSource);

// POST запрос на валидацию команды
router.post("/teams/validate", sourceController.validateTeam);

// GET запрос на получение одного источника по id
router.get("/sources/:id", sourceController.getOneSource);

router.put("/users/:userEmail/ratings", sourceController.saveRatingsCheckboxes);

router.get("/users/:userEmail/ratings", sourceController.getSelectedRatings);

router.get(
  "/autodownload/:userEmail/:ip",
  sourceController.getAutoDownloadSources
);

router.put("/users/refreshRate", sourceController.putTimerForSend);

// PUT запрос на обновление данных источника по id
router.put("/sources/:id", sourceController.updateSource);

// DELETE запрос на удаление источника по id
router.delete("/sources/:id", sourceController.deleteSource);

module.exports = router;
