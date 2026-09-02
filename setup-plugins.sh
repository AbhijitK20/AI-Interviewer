#!/bin/bash
# Setup script for integrating plugins into AI Interviewer project
# Run from project root: bash setup-plugins.sh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGINS_DIR="$HOME/plugins"

echo "=== Setting up plugins for AI Interviewer ==="
echo ""

# 1. i-have-adhd - Copy skill to project
echo "1. Setting up i-have-adhd skill..."
mkdir -p "$PROJECT_DIR/.claude/skills"
cp -r "$PLUGINS_DIR/i-have-adhd/skills/i-have-adhd" "$PROJECT_DIR/.claude/skills/" 2>/dev/null
echo "   ✓ i-have-adhd skill copied"

# 2. no-ai-slop - Copy skill to project
echo "2. Setting up no-ai-slop skill..."
cp -r "$PLUGINS_DIR/no-ai-slop/skills/no-ai-slop" "$PROJECT_DIR/.claude/skills/" 2>/dev/null
echo "   ✓ no-ai-slop skill copied"

# 3. hallmark - Copy skill to project
echo "3. Setting up hallmark skill..."
cp -r "$PLUGINS_DIR/hallmark/skills/hallmark" "$PROJECT_DIR/.claude/skills/" 2>/dev/null
echo "   ✓ hallmark skill copied"

# 4. taste-skill - Copy skill to project
echo "4. Setting up taste-skill..."
cp -r "$PLUGINS_DIR/taste-skill/" "$PROJECT_DIR/.skills/taste-skill/" 2>/dev/null
echo "   ✓ taste-skill copied"

# 5. Create symlinks for easy access
echo "5. Creating symlinks..."
ln -sf "$PLUGINS_DIR/openseo" "$PROJECT_DIR/tools/openseo" 2>/dev/null
ln -sf "$PLUGINS_DIR/book-to-skill" "$PROJECT_DIR/tools/book-to-skill" 2>/dev/null
ln -sf "$PLUGINS_DIR/ai-job-search" "$PROJECT_DIR/tools/ai-job-search" 2>/dev/null
ln -sf "$PLUGINS_DIR/ComfyUI" "$PROJECT_DIR/tools/ComfyUI" 2>/dev/null
echo "   ✓ Tools symlinked"

# 6. Install i-have-adhd rules into AGENTS.md
echo "6. Updating AGENTS.md with i-have-adhd rules..."
if [ -f "$PROJECT_DIR/AGENTS.md" ]; then
  if ! grep -q "i-have-adhd" "$PROJECT_DIR/AGENTS.md"; then
    cat >> "$PROJECT_DIR/AGENTS.md" << 'RULES'

## Output Style (i-have-adhd)
1. Lead with the answer or next action: command, path, or snippet first.
2. Number steps. Cap lists at 5 items.
3. End with one concrete next step.
4. Suppress tangents.
5. Restate state every turn.
6. Specific time estimates (minutes, not "a bit").
7. Make wins visible.
8. Matter-of-fact errors.
9. No preamble. No recap. No closers.
RULES
    echo "   ✓ Rules added to AGENTS.md"
  else
    echo "   - Rules already in AGENTS.md"
  fi
else
  echo "   - No AGENTS.md found, skipping"
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Plugins ready to use:"
echo "  - i-have-adhd: Concise, action-first responses"
echo "  - no-ai-slop: Remove AI writing patterns"
echo "  - hallmark: Anti-AI-slop UI design"
echo "  - taste-skill: Frontend design anti-slop"
echo "  - openseo: SEO optimization (tools/openseo/)"
echo "  - book-to-skill: Convert books to skills (tools/book-to-skill/)"
echo "  - ai-job-search: Job search framework (tools/ai-job-search/)"
echo "  - ComfyUI: Image generation (tools/ComfyUI/)"
