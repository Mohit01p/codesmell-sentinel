const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const repoController = require("../controllers/repoController");

router.get("/available", requireAuth, repoController.listAvailableRepos);
router.get("/", requireAuth, repoController.listConnectedRepos);
router.post("/activate", requireAuth, repoController.activateRepo);
router.delete("/:id", requireAuth, repoController.deactivateRepo);

module.exports = router;