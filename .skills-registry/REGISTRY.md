# Skills & Plugins Registry

Central index of all AI agent skills, plugins, and reference repositories.

## Quick Reference

| Category | Count | Description |
|----------|-------|-------------|
| Design & UI | 5 repos | Frontend design, diagrams, UI guidelines |
| Development | 2 repos | Browser automation CLI, codebase intelligence |
| Security | 1 repo | 818 cybersecurity skills |
| Science | 1 repo | 163 scientific research skills |
| Browser | 2 repos | AI browser automation, video production |
| Memory | 3 repos | Agent memory systems, codebase knowledge graphs |
| Harness | 2 repos | Agent reliability engineering, role-based agents |
| MCP | 1 repo | Model Context Protocol servers |
| Official | 4 repos | Anthropic, OpenAI, Vercel official skills |

---

## Design & UI

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **taste-skill** | 82k | Anti-slop frontend design skills | None (skills only) |
| **awesome-design-md** | 111k | 60+ DESIGN.md from real brands | None (copy DESIGN.md) |
| **diagram-design** | 28k | 39 editorial diagram types (HTML+SVG) | None (skills only) |
| **web-interface-guidelines** | 820 | Vercel's web UI guidelines | `./install.sh` |
| **vercel-agent-skills** | 30k | Vercel's official skill collection | None (reference) |

## Development

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **playwright-cli** | 12.9k | Microsoft Playwright CLI with skills | `npm install` |
| **Graft** | 4.9k | Codebase-aware skill for Claude Code/Cursor/Codex | `graft init` |

## Security

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **Anthropic-Cybersecurity-Skills** | 31.6k | 818 cybersecurity skills, MITRE ATT&CK mapped | None (skills only) |

## Science

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **scientific-agent-skills** | 33k | 163 scientific research skills | None (skills only) |

## Browser & Media

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **browser-use** | 110k | AI browser automation (Python) | `pip install browser-use` |
| **OpenMontage** | 54.3k | Agentic video production system | `make setup` (needs Python 3.10+, FFmpeg) |

## Memory & Knowledge

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **agentmemory** | 27k | Persistent memory for coding agents | `npm install && npm run build` |
| **OpenViking** | 34k | Context database for AI agents | Heavy (Rust+CMake required) |
| **codebase-memory-mcp** | - | Knowledge graph MCP server (158 languages) | Download binary from releases |

## Harness Engineering

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **awesome-harness-engineering** | 3.9k | Curated harness engineering resources | None (reference) |
| **agency-agents** | 148.9k | 144 role-based AI agent personas | `./scripts/install.sh` |

## MCP (Model Context Protocol)

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **awesome-mcp-servers** | 100k+ | Curated MCP server list (1000+) | None (reference) |

## Official Skill Collections

| Repo | Stars | Purpose | Setup |
|------|-------|---------|-------|
| **anthropic-skills** | 62.6k | Anthropic's official Claude skills | None (reference) |
| **openai-plugins** | 25k+ | OpenAI's plugins (Codex, etc.) | None (reference) |
| **role-specific-plugins** | - | OpenAI role-specific skill templates | None (templates) |
| **vercel-skills-cli** | 29.9k | `npx skills` CLI tool | `npm install` |

---

## How to Use Skills in Your Projects

### Option 1: Copy SKILL.md directly
```bash
cp .skills-registry/design/01-taste-skill/skills/design-taste-frontend/SKILL.md your-project/.claude/skills/
```

### Option 2: Use npx skills CLI
```bash
npx skills add Leonxlnx/taste-skill
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
npx skills add VoltAgent/awesome-design-md
```

### Option 3: Use the helper script
```bash
./use-skill.sh taste-skill ./my-project
./use-skill.sh diagram-design ./my-project
```

---

## Agent Compatibility

| Agent | Skills Path | Format |
|-------|-------------|--------|
| Claude Code | `~/.claude/skills/` or `.claude/skills/` | SKILL.md |
| Cursor | `.cursor/skills/` | SKILL.md |
| Codex CLI | `AGENTS.md` (project root) | AGENTS.md |
| OpenCode | `~/.config/opencode/skills/` | SKILL.md |
| Gemini CLI | `.gemini/skills/` | SKILL.md |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |

---

## License Summary

| Repo | License |
|------|---------|
| taste-skill | MIT |
| awesome-design-md | MIT |
| diagram-design | MIT |
| web-interface-guidelines | MIT |
| Anthropic-Cybersecurity-Skills | Apache-2.0 |
| scientific-agent-skills | MIT (individual skills may vary) |
| browser-use | MIT |
| agentmemory | Apache-2.0 |
| OpenViking | AGPL-3.0 |
| anthropic-skills | Apache-2.0 |
| openai-plugins | MIT |
| vercel-skills-cli | MIT |
| playwright-cli | Apache-2.0 |
| agency-agents | MIT |
| Graft | MIT |
| OpenMontage | AGPL-3.0 |
| codebase-memory-mcp | MIT |
