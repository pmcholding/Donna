# Capability: Prompt Editor

## Overview
Web-based editor for modifying the Donna agent's system prompt file directly from a browser.

---

## ADDED Requirements

### Requirement: Load prompt file from GitHub
The editor SHALL fetch the current content of `system_prompt_donna.md` from the GitHub repository when the page loads.

#### Scenario: Successful file load
- **Given** the editor page is accessed
- **When** the page loads
- **Then** the current content of the prompt file is displayed in the editor
- **And** the file's SHA is stored for conflict detection

#### Scenario: File load failure
- **Given** the editor page is accessed
- **When** the GitHub API returns an error
- **Then** an error message is displayed
- **And** a retry button is available

---

### Requirement: Edit prompt with markdown preview
The editor SHALL provide a markdown editing interface with live preview functionality.

#### Scenario: Edit with preview
- **Given** the prompt content is loaded
- **When** the user modifies the text
- **Then** the preview panel updates in real-time
- **And** markdown formatting is rendered correctly

---

### Requirement: Save changes to GitHub
The editor SHALL save modifications back to the GitHub repository as a new commit.

#### Scenario: Successful save
- **Given** the user has made changes
- **When** the user clicks the save button
- **Then** a commit is created in the repository
- **And** a success message is displayed
- **And** the local SHA is updated

#### Scenario: Save conflict
- **Given** the file was modified externally
- **When** the user attempts to save
- **Then** a conflict error is displayed
- **And** the user is prompted to refresh and retry

---

### Requirement: Display save status
The editor SHALL provide feedback about save operations and last modification time.

#### Scenario: Show last saved time
- **Given** the user has saved changes
- **When** the save completes successfully
- **Then** the timestamp of the last save is displayed

#### Scenario: Show saving progress
- **Given** the user clicks save
- **When** the API call is in progress
- **Then** a loading indicator is displayed
- **And** the save button is disabled

---

## Related Capabilities
- None (standalone capability)

## Dependencies
- GitHub repository with write access
- GitHub Personal Access Token
- Vercel deployment platform
