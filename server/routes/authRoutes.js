const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/github", authController.redirectToGithub);
router.get("/github/callback", authController.handleGithubCallback);
router.get("/me", authController.getCurrentUser);
router.post("/logout", authController.logout);

module.exports = router;