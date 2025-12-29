# Design: Add Prompt Editor

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │   Vercel        │     │   GitHub        │
│   (Client)      │────▶│   (Next.js)     │────▶│   (Storage)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   n8n           │
                        │   (Reads file)  │
                        └─────────────────┘
```

## File Structure

```
donna-editor/
├── app/
│   ├── layout.tsx          # Root layout with basic styling
│   ├── page.tsx            # Main editor page (client component)
│   └── api/
│       └── file/
│           └── route.ts    # GET/PUT handlers for GitHub API
├── lib/
│   └── github.ts           # Octokit client and helper functions
├── .env.local              # Local environment variables
├── .env.example            # Template for environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies
```

## Data Flow

### Read Flow
1. Client loads page
2. page.tsx calls GET /api/file
3. API route calls lib/github.ts getFileContent()
4. Octokit fetches from GitHub API
5. Content decoded from base64
6. Returns { content, sha } to client
7. Editor displays content

### Write Flow
1. User clicks "Save"
2. page.tsx calls PUT /api/file with { content, sha, message }
3. API route calls lib/github.ts updateFileContent()
4. Octokit creates commit via GitHub API
5. Returns new sha
6. Client updates local sha for next save

## Key Decisions

### Why No Authentication?
- Simplicity: Single user (client) accessing the editor
- Security through obscurity: URL not publicly shared
- Can be added later if needed

### Why GitHub API vs Direct File?
- n8n already reads from GitHub
- Provides version history automatically
- No need for separate file storage

### Why @uiw/react-md-editor?
- All-in-one: editor + preview
- Actively maintained
- Good default styling
- Works well with Next.js

### Why Server-Side API Route?
- Keeps GitHub token secure (never exposed to browser)
- Handles base64 encoding/decoding
- Single point for error handling

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| GITHUB_TOKEN | Personal Access Token | ghp_xxx |
| GITHUB_OWNER | Repository owner | username |
| GITHUB_REPO | Repository name | Donna |
| GITHUB_FILE_PATH | File to edit | system_prompt_donna.md |
| GITHUB_BRANCH | Target branch | main |

## Error Handling

| Error | Handling |
|-------|----------|
| Network failure | Show retry button |
| 401 Unauthorized | Check token validity |
| 409 Conflict | File was modified, refresh and retry |
| Rate limit | Show message with reset time |

## Future Considerations
- Add simple password protection if needed
- Add version history view using GitHub commits API
- Add syntax highlighting for {{variables}}
