import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const path = process.env.GITHUB_FILE_PATH!;
const branch = process.env.GITHUB_BRANCH || "main";

export interface FileContent {
  content: string;
  sha: string;
}

export async function getFileContent(): Promise<FileContent> {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  if (Array.isArray(response.data) || response.data.type !== "file") {
    throw new Error("Path is not a file");
  }

  const content = Buffer.from(response.data.content, "base64").toString("utf-8");
  const sha = response.data.sha;

  return { content, sha };
}

export async function updateFileContent(
  content: string,
  sha: string,
  message?: string
): Promise<string> {
  const response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message: message || `Update ${path}`,
    content: Buffer.from(content).toString("base64"),
    sha,
  });

  return response.data.content?.sha || sha;
}
