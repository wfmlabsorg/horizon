#!/bin/bash
# HORIZON Codespace Setup Script
# Runs automatically via postCreateCommand in devcontainer.json

set -e

echo "============================================"
echo "  HORIZON — Planning Horizon Engine"
echo "  Codespace Setup"
echo "============================================"
echo ""

# 1. Find the repository
REPO_DIR=""
if [ -d "/workspaces/horizon" ]; then
  REPO_DIR="/workspaces/horizon"
elif [ -d "$HOME/horizon" ]; then
  REPO_DIR="$HOME/horizon"
else
  echo "ERROR: Cannot find HORIZON repository"
  exit 1
fi
echo "[1/9] Repository found: $REPO_DIR"

# 2. Create symlink if needed
if [ "$REPO_DIR" != "$HOME/horizon" ]; then
  ln -sf "$REPO_DIR" "$HOME/horizon"
  echo "[2/9] Symlinked $REPO_DIR -> ~/horizon"
else
  echo "[2/9] Repository already at ~/horizon"
fi

# 3. Install Bun
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo "[3/9] Bun installed"
else
  echo "[3/9] Bun already installed"
fi

# Ensure bun is in PATH for rest of script
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# 4. Install Claude Code
if ! command -v claude &> /dev/null; then
  bun install -g @anthropic-ai/claude-code
  echo "[4/9] Claude Code installed"
else
  echo "[4/9] Claude Code already installed"
fi

# 5. Create ~/.claude/ directory structure
mkdir -p "$HOME/.claude"
echo "[5/9] Created ~/.claude/"

# 6. Create symlinks from ~/.claude/ into repo
ln -sf "$HOME/horizon/skills" "$HOME/.claude/skills"
ln -sf "$HOME/horizon/hooks" "$HOME/.claude/hooks"
ln -sf "$HOME/horizon/Tools" "$HOME/.claude/Tools"
ln -sf "$HOME/horizon/context" "$HOME/.claude/context"
ln -sf "$HOME/horizon/agents" "$HOME/.claude/agents"
echo "[6/9] Symlinked skills, hooks, Tools, context, agents -> ~/.claude/"

# 7. Copy CLAUDE.md to home directory
cp "$HOME/horizon/CLAUDE.md" "$HOME/CLAUDE.md"
echo "[7/9] Copied CLAUDE.md to ~/CLAUDE.md"

# 8. Generate settings.json with hook registrations
cat > "$HOME/.claude/settings.json" << 'SETTINGS_EOF'
{
  "env": {
    "DA": "HORIZON",
    "PAI_DIR": "/home/vscode/.claude",
    "PAI_SOURCE_APP": "HORIZON",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CODESPACE": "true"
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bun run $HOME/.claude/hooks/initialize-session.ts"
          },
          {
            "type": "command",
            "command": "bun run $HOME/.claude/hooks/load-core-context.ts"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bun run $HOME/.claude/hooks/context-reminder.ts"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run $HOME/.claude/hooks/security-validator.ts"
          }
        ]
      }
    ]
  }
}
SETTINGS_EOF
echo "[8/9] Generated settings.json with hook registrations"

# 9. Generate skill index and create projects directory
bun run "$HOME/.claude/Tools/GenerateSkillIndex.ts" 2>/dev/null || echo "  (Skill index generation will complete on first session)"
mkdir -p "$HOME/horizon/books"
echo "[9/9] Skill index generated, books/ directory ready"

echo ""
echo "============================================"
echo "  HORIZON Setup Complete!"
echo ""
echo "  To start: run 'claude' in terminal"
echo "  Books of business: ~/horizon/books/"
echo "  Skills: ~/horizon/skills/ (17 analytical skills)"
echo "  Agents: ~/horizon/agents/ (11 planning agents)"
echo "============================================"
