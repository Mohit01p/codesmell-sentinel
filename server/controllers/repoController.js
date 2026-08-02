const githubService = require("../services/githubService");
const User = require("../models/User");
const Repo = require("../models/Repo");

// GET /api/repos/available — repos from GitHub the user can activate
async function listAvailableRepos(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    const repos = await githubService.listUserRepos(user.accessToken);

    const simplified = repos.map((r) => ({
      githubRepoId: String(r.id),
      fullName: r.full_name,
      private: r.private,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, repos: simplified });
  } catch (err) {
    next(err);
  }
}

// GET /api/repos — repos already activated (saved in our DB)
async function listConnectedRepos(req, res, next) {
  try {
    const repos = await Repo.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, repos });
  } catch (err) {
    next(err);
  }
}

// POST /api/repos/activate — body: { repoFullName, githubRepoId }
async function activateRepo(req, res, next) {
  try {
    const { repoFullName, githubRepoId } = req.body;
    if (!repoFullName || !githubRepoId) {
      return res.status(400).json({
        success: false,
        message: "repoFullName and githubRepoId are required",
      });
    }

    const user = await User.findById(req.userId);

    let webhookId = null;
    let webhookWarning = null;
    try {
      const webhook = await githubService.registerWebhook(
        user.accessToken,
        repoFullName
      );
      webhookId = String(webhook.id);
    } catch (webhookErr) {
      // Expected to fail until we have a public URL (Day 4 / ngrok)
      webhookWarning =
        "Repo activated, but webhook registration failed (expected until ngrok is set up on Day 4).";
      console.warn("[repoController] webhook registration failed:", webhookErr.message);
    }

    const repo = await Repo.findOneAndUpdate(
      { owner: req.userId, githubRepoId },
      { owner: req.userId, repoName: repoFullName, githubRepoId, webhookId, isActive: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, repo, warning: webhookWarning });
  } catch (err) {
    next(err);
  }
}
// DELETE /api/repos/:id — deactivate a repo (removes it from our DB)
async function deactivateRepo(req, res, next) {
  try {
    const repo = await Repo.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repo not found" });
    }

    res.json({ success: true, message: "Repo deactivated" });
  } catch (err) {
    next(err);
  }
}
module.exports = {
  listAvailableRepos,
  listConnectedRepos,
  activateRepo,
  deactivateRepo,
};