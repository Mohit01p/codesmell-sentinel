/**
 * GitHub OAuth App configuration.
 *
 * To get real values (Day 2 will use these):
 * 1. Go to https://github.com/settings/developers -> "New OAuth App"
 * 2. Homepage URL: http://localhost:5173 (your React dev server, for now)
 * 3. Authorization callback URL: http://localhost:5000/api/auth/github/callback
 * 4. Copy the generated Client ID + generate a Client Secret
 * 5. Put both in your .env file (see .env.example)
 *
 * Webhook secret (used later, Day 4) is a string YOU make up -
 * it's used to verify that webhook events really came from GitHub.
 */
module.exports = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5000/api/auth/github/callback",
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  oauthAuthorizeUrl: "https://github.com/login/oauth/authorize",
  oauthTokenUrl: "https://github.com/login/oauth/access_token",
  apiBaseUrl: "https://api.github.com",
  scopes: ["repo", "read:user", "admin:repo_hook"],
};
