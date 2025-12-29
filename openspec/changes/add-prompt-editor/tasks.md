# Tasks: Add Prompt Editor

## Phase 1: Project Setup
- [x] Create Next.js project with TypeScript and Tailwind
- [x] Install dependencies (@octokit/rest, @uiw/react-md-editor)
- [x] Configure environment variables template

## Phase 2: GitHub Integration
- [x] Create lib/github.ts with Octokit client
- [x] Implement getFileContent() function (read + decode base64)
- [x] Implement updateFileContent() function (encode + commit)
- [x] Create API route GET /api/file (returns content + sha)
- [x] Create API route PUT /api/file (saves content to GitHub)

## Phase 3: Editor UI
- [x] Create basic layout.tsx with header
- [x] Create page.tsx with markdown editor component
- [x] Add loading state while fetching file
- [x] Add save button with loading state
- [x] Add success/error feedback messages
- [x] Add last saved timestamp display

## Phase 4: Testing & Polish
- [x] Test read flow locally
- [x] Test save flow locally
- [x] Verify commit appears in GitHub
- [x] Handle error cases (network, API limits)

## Phase 5: Deployment
- [x] Deploy to Vercel via CLI
- [x] Configure environment variables in Vercel
- [x] Test production deployment
- [x] Production URL: https://donna-editor.vercel.app

## Validation
- [x] File loads correctly from GitHub
- [x] Editor displays markdown with preview
- [x] Save creates commit in repository
- [x] n8n can still read the file after changes
