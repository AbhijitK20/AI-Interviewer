# Contributing Guide

## Git Workflow (Important!)

**Always pull before pushing.** This prevents lost work.

```bash
# Before starting work
git pull origin main

# After making changes
git add -A
git commit -m "your changes"

# Before pushing - ALWAYS do this
git pull origin main --rebase

# Then push
git push origin main
```

## Why `--rebase`?

Without rebase, you get messy merge commits. With rebase, your changes sit cleanly on top of teammate's changes.

```
Bad (merge):  A--B--C--M--D (messy merge commit)
Good (rebase): A--B--C--D (clean history)
```

## Setting Up (One Time)

Run this once on your machine:
```bash
git config --global pull.rebase true
git config --global fetch.prune true
```

Now `git pull` automatically rebases. No extra commands needed.

## PR Rules

1. Create a feature branch
2. Push your branch
3. Create a PR on GitHub
4. Wait for all 13 checks to pass
5. Get approval from maintainer
6. Merge

## Never Push Directly to `main`

Always use PRs. This ensures:
- Code review happens
- All checks pass
- Changes are tested before merge
