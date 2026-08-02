const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const scanController = require("../controllers/scanController");

router.get("/:repoId", requireAuth, scanController.getScanHistory);
router.get("/detail/:scanId", requireAuth, scanController.getScanDetail);

module.exports = router;