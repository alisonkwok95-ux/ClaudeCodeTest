# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of self-contained browser games. Each game is a single HTML file with embedded CSS and JavaScript — no build step, no dependencies, no server required.

## Running the Games

Open any HTML file directly in a browser:
```bash
start tictactoe.html
start tetris.html
```

## Architecture

Each game file is fully self-contained:
- **HTML** — structure and layout
- **CSS** — styling (dark theme: `#1a1a2e` background, `#e94560` accent)
- **JavaScript** — all game logic using vanilla JS and HTML5 Canvas

There are no shared files, libraries, or build artifacts.

## Git Workflow

- Commit every meaningful change with a descriptive message
- Push to `origin/main` (GitHub: `alisonkwok95-ux/ClaudeCodeTest`) after each commit
- Use `git log --oneline` to review history
