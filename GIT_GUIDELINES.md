# Git and Collaboration Guidelines

This document outlines the standard Git workflow, rules for pushing code, instructions for AI agents, and a basic Git cheat sheet.

---

## 🛑 Golden Rules for Pushing Code

1. **Never Push Directly to `main`**
   - The `main` branch is strictly protected and should always remain in a production-ready state.
2. **Push to `testing-branch` Only**
   - All active development and commits must be pushed to the `testing-branch` branch.
3. **Always Pull Before You Push**
   - Before attempting to push your code, always run `git pull` (or `git pull origin testing-branch`) to avoid merge conflicts and ensure your local environment is up to date with the remote repository.

---

## 🤖 Instructions for AI Agents

If an AI Agent is working on this repository, it MUST adhere to the following workflow:

1. **Comment Your Changes:** Whenever you make a code change, you must add an inline comment explaining what was changed and why (e.g., `// Added activeChatUser state to fix rendering crash`).
2. **Update Documentation Before Pushing:** Before you stage and push the code to `testing-branch`, you MUST:
   - Update any relevant technical documentation (if applicable).
   - Update the `README.md` file if new features, dependencies, or setup instructions were introduced.
3. **Follow the Golden Rules:** Ensure that you are on `testing-branch`, pull the latest code, and never commit directly to `main`.

---

## 📚 Basic Git Cheat Sheet

Here are the most common Git commands and what they do:

### 1. Checking Status and Fetching Updates
*   **`git status`**
    *   *What it does:* Shows the current state of your working directory (which files are modified, staged, or untracked).
*   **`git pull origin testing-branch`**
    *   *What it does:* Fetches the newest changes from the remote `testing-branch` and merges them into your local workspace. (Do this before pushing!).

### 2. Branching
*   **`git branch`**
    *   *What it does:* Lists all local branches. The branch you are currently on will have a `*` next to it.
*   **`git checkout testing-branch`** (or `git switch testing-branch`)
    *   *What it does:* Switches your current workspace to the `testing-branch` branch.

### 3. Staging and Committing Code
*   **`git add .`**
    *   *What it does:* Stages all modified, deleted, and newly created files in the current directory to be included in the next commit.
*   **`git commit -m "Your descriptive message"`**
    *   *What it does:* Takes a snapshot of your staged files and saves them locally with a message explaining the change.

### 4. Pushing Code
*   **`git push origin testing-branch`**
    *   *What it does:* Uploads your local commits to the remote GitHub repository on the `testing-branch` branch.

### 5. Reviewing History
*   **`git log`**
    *   *What it does:* Shows a chronological list of past commits, including the author, date, and commit message. Press `q` to exit the log view.

---

### End-to-End Workflow Example
```bash
# 1. Ensure you are on the right branch
git checkout testing-branch

# 2. Pull latest changes to avoid conflicts
git pull origin testing-branch

# 3. Make your code changes... (Remember to add comments!)

# 4. Stage your changes
git add .

# 5. Commit your changes
git commit -m "feat: added new UI slider component"

# 6. Push to testing-branch
git push origin testing-branch
```
