# GitHub MCP Server Setup

## 1. GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token (classic)"
3. Note: `Cursor MCP GitHub Integration`
4. Expiration: `90 days`
5. Scopes:
   - ✅ `repo` (full repository access)
   - ✅ `workflow` (GitHub Actions)
   - ✅ `read:org` (if needed)

## 2. Cursor MCP Configuration
1. Open Cursor Settings → Features → MCP
2. Click: "+ Add New MCP Server"
3. Configure:
   - **Name**: `GitHub`
   - **Type**: `SSE`
   - **URL**: `https://cursor.directory/mcp/github`

## 3. Environment Variable
Add to your shell profile (~/.zshrc or ~/.bashrc):
```bash
export GITHUB_TOKEN="your_github_token_here"
```

## 4. Restart Cursor
After setting up, restart Cursor to load the MCP server.

## Available Tools
Once connected, I'll have access to:
- List workflows and their status
- View workflow runs and logs
- Create/update issues
- Manage pull requests
- And much more!
