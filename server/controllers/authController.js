const jwt = require("jsonwebtoken");
const githubConfig = require("../config/github");
const githubService = require("../services/githubService");
const User = require("../models/User");

function redirectToGithub(req, res) {
  const params = new URLSearchParams({
    client_id: githubConfig.clientId,
    redirect_uri: githubConfig.callbackUrl,
    scope: githubConfig.scopes.join(" "),
  });

  res.redirect(`${githubConfig.oauthAuthorizeUrl}?${params.toString()}`);
}

async function handleGithubCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: "Missing code from GitHub" });
    }

    const accessToken = await githubService.exchangeCodeForToken(code);
    const githubUser = await githubService.fetchGithubUser(accessToken);

    const user = await User.findOneAndUpdate(
      { githubId: String(githubUser.id) },
      {
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken,
      },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ success: true, user: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "username avatarUrl githubId"
    );

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: true, user: null });
  }
}

function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
}

module.exports = {
  redirectToGithub,
  handleGithubCallback,
  getCurrentUser,
  logout,
};