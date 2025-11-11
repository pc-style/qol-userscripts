# Auto Version Bump

This repository automatically increments the version by 0.0.1 on every `git push`.

## How It Works

A pre-push git hook:
1. Reads current version from `package.json`
2. Increments patch version (0.0.1)
3. Updates all `@version` tags in `scripts/*.user.js`
4. Rebuilds the project
5. Commits the version bump
6. Proceeds with push

## Current Version

Check `package.json` for the current version.

## Manual Version Bump

To manually set a version:
```bash
npm version <major|minor|patch>
# or
npm version 2.0.0
```

## Disable Auto-Bump

To disable, remove the pre-push hook:
```bash
rm .git/hooks/pre-push
```
