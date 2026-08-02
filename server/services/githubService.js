const axios = require("axios");
const githubConfig = require("../config/github");

async function exchangeCodeForToken(code) {
  const response = await axios.post(
    githubConfig.oauthTokenUrl,
    {
      client_id: githubConfig.clientId,
      client_secret: githubConfig.clientSecret,
      code,
    },
    { headers: { Accept: "application/json" } }
  );

  if (response.data.error) {
    throw new Error(
      `GitHub OAuth error: ${response.data.error_description || response.data.error}`
    );
  }

  return response.data.access_token;
}

async function fetchGithubUser(accessToken) {
  const response = await axios.get(`${githubConfig.apiBaseUrl}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  return response.data;
}
async function listUserRepos(accessToken) {
  const response = await axios.get(`${githubConfig.apiBaseUrl}/user/repos`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
    params: { per_page: 100, sort: "updated" },
  });
  return response.data;
}

async function registerWebhook(accessToken, repoFullName) {
  const response = await axios.post(
    `${githubConfig.apiBaseUrl}/repos/${repoFullName}/hooks`,
    {
      name: "web",
      active: true,
      events: ["pull_request"],
      config: {
        url: `${process.env.SERVER_PUBLIC_URL || "http://localhost:5000"}/webhook/github`,
        content_type: "json",
        secret: githubConfig.webhookSecret,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  return response.data;
}
async function fetchPRFiles(accessToken, owner, repo, prNumber) {
  const response = await axios.get(
    `${githubConfig.apiBaseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
      params: { per_page: 100 },
    }
  );
  return response.data; // array of { filename, status, patch, additions, deletions, ... }
}
async function fetchFileRawContent(accessToken, rawUrl) {
  const response = await axios.get(rawUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: "text",
    transformResponse: [(data) => data], // don't let axios try to JSON-parse it
  });
  return response.data;
}
async function postPRComment(accessToken, owner, repo, prNumber, commentBody) {
  const response = await axios.post(
    `${githubConfig.apiBaseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    { body: commentBody },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  return response.data;
}
module.exports = {
  exchangeCodeForToken,
  fetchGithubUser,
  listUserRepos,
  registerWebhook,
  fetchPRFiles,
  fetchFileRawContent,
  postPRComment,
};