#!/bin/bash
# Quick Skill Installer
# Usage: ./use-skill.sh <skill-name> [target-project]
#
# Examples:
#   ./use-skill.sh taste-skill ./my-project
#   ./use-skill.sh web-design-guidelines ./my-project
#   ./use-skill.sh diagram-design

SKILL_REGISTRY="$(cd "$(dirname "$0")/.skills-registry" && pwd)"
TARGET="${2:-.}"

declare -A SKILL_MAP=(
  ["taste-skill"]="design/01-taste-skill"
  ["awesome-design-md"]="design/02-awesome-design-md"
  ["diagram-design"]="design/03-diagram-design"
  ["web-guidelines"]="design/04-web-interface-guidelines"
  ["vercel-skills"]="design/05-vercel-agent-skills"
  ["playwright"]="development/01-playwright-cli"
  ["graft"]="development/02-graft"
  ["cybersecurity"]="security/01-anthropic-cybersecurity-skills"
  ["science"]="science/01-scientific-agent-skills"
  ["browser-use"]="browser/01-browser-use"
  ["openmontage"]="browser/02-openmontage"
  ["agentmemory"]="memory/01-agentmemory"
  ["openviking"]="memory/02-openviking"
  ["codebase-memory"]="memory/03-codebase-memory-mcp"
  ["harness"]="harness/01-awesome-harness-engineering"
  ["agency-agents"]="harness/02-agency-agents"
  ["mcp-servers"]="mcp/01-awesome-mcp-servers"
  ["anthropic-skills"]="official/01-anthropic-skills"
  ["openai-plugins"]="official/02-openai-plugins"
  ["openai-roles"]="official/03-openai-role-plugins"
  ["vercel-cli"]="official/04-vercel-skills-cli"
)

if [ -z "$1" ]; then
  echo "Available skills:"
  echo ""
  for skill in $(echo "${!SKILL_MAP[@]}" | tr ' ' '\n' | sort); do
    echo "  $skill"
  done
  echo ""
  echo "Usage: $0 <skill-name> [target-project]"
  exit 0
fi

SKILL_NAME="$1"
SKILL_PATH="${SKILL_MAP[$SKILL_NAME]}"

if [ -z "$SKILL_PATH" ]; then
  echo "Unknown skill: $SKILL_NAME"
  echo "Run '$0' to see available skills."
  exit 1
fi

SOURCE="$SKILL_REGISTRY/$SKILL_PATH"
mkdir -p "$TARGET/.claude/skills"
ln -sf "$SOURCE" "$TARGET/.claude/skills/$SKILL_NAME"
echo "Installed '$SKILL_NAME' -> $TARGET/.claude/skills/$SKILL_NAME"
