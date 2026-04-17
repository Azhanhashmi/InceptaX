const axios = require("axios");

const parseGitHubUrl = (url) => {
  try {
    const cleaned = url.replace(/\.git$/, "").replace(/\/$/, "");
    const parts = cleaned.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch { return null; }
};

const fetchRepoData = async (repoUrl) => {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return { error: "Invalid GitHub URL", repoData: null };

  const { owner, repo } = parsed;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
  };

  try {
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });

    let readmeContent = "No README found.";
    try {
      const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      readmeContent = Buffer.from(readmeRes.data.content, "base64").toString("utf-8").slice(0, 3000);
    } catch { readmeContent = "README not available."; }

    let fileTree = [];
    try {
      const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      fileTree = treeRes.data.map((f) => `${f.type === "dir" ? "📁" : "📄"} ${f.name}`);
    } catch { fileTree = ["File tree unavailable"]; }

    return {
      error: null,
      repoData: {
        name: repoRes.data.name,
        description: repoRes.data.description || "",
        language: repoRes.data.language || "Unknown",
        topics: repoRes.data.topics || [],
        readme: readmeContent,
        fileTree,
      },
    };
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) return { error: "Repository not found or private.", repoData: null };
    if (status === 403) return { error: "GitHub API rate limit exceeded.", repoData: null };
    return { error: err.message, repoData: null };
  }
};

module.exports = { fetchRepoData, parseGitHubUrl };
