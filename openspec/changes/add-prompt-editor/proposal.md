# Proposal: Add Prompt Editor

## Summary
Create a simple web-based editor for the `system_prompt_donna.md` file, allowing the client to edit the agent's prompt without needing to access GitHub directly.

## Problem
Currently, to modify the Donna agent's behavior, someone needs to:
1. Access the GitHub repository
2. Know how to edit markdown files
3. Commit changes manually

This creates friction for the client who wants to adjust the prompt.

## Solution
A minimal Next.js application deployed on Vercel that:
1. Reads the prompt file from GitHub
2. Provides a markdown editor with preview
3. Saves changes directly to GitHub via API

## Scope
- Single-page application
- No authentication (simple access)
- Editor with live preview
- Save to GitHub with commit message

## Out of Scope
- Version history UI
- Multiple file editing
- User authentication
- Collaborative editing

## Technical Approach
- **Framework:** Next.js 14 (App Router)
- **Editor:** @uiw/react-md-editor
- **GitHub Integration:** @octokit/rest
- **Deployment:** Vercel

## Dependencies
- GitHub Personal Access Token with repo write access
- Vercel account for deployment

## Risks
- No authentication means anyone with the URL can edit
- GitHub API rate limits (5000 requests/hour with token)

## Success Criteria
- Client can access the editor via URL
- Client can edit and preview markdown
- Changes are saved to GitHub
- n8n continues reading the file normally
