# Focus Dashboard

A Chrome extension that replaces your new tab page with a personal productivity dashboard powered by Notion.

## Features

- Displays current date on every new tab
- Shows tasks from your Notion database grouped by category: **Health**, **Work**, **Follow-ups**
- Mark tasks complete directly from the dashboard (syncs back to Notion)
- Credentials stored securely in `chrome.storage.local`

## Status

**Phase 1 — Skeleton** (current): Dashboard shell loads, date renders, Notion integration is stubbed.

## Installation (development)

1. Clone or download this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. Open a new tab — you should see the Focus Dashboard.

## Configuration

1. Click the **Settings** icon or go to `chrome://extensions` → Focus Dashboard → Extension options.
2. Enter your **Notion Integration Token** (`secret_...`) and **Notion Database ID**.
3. Click **Save Settings**.

### Setting up Notion

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create a new internal integration.
2. Copy the **Internal Integration Token**.
3. Open your tasks database in Notion, click **...** → **Add connections** → select your integration.
4. Copy the database ID from the URL: `notion.so/<workspace>/<DATABASE_ID>?v=...`

### Expected database schema

| Property   | Type     | Values                             |
|------------|----------|------------------------------------|
| Name       | Title    | Task title                         |
| Done       | Checkbox | Completion state                   |
| Category   | Select   | `Health`, `Work`, or `Follow-ups`  |

## Project structure

```
focus-dashboard-extension/
├── manifest.json      # Extension config (Manifest V3)
├── newtab.html        # New tab page markup
├── newtab.js          # Dashboard UI logic
├── styles.css         # Styles
├── options.html       # Settings page
├── options.js         # Settings logic
├── notion.js          # Notion API integration layer
├── PRD.md             # Product requirements
├── TASKS.md           # Phase checklist
├── CONTEXT.md         # Architecture & decisions
├── WORKLOG.md         # Session-by-session log
└── README.md          # This file
```

## Roadmap

See [TASKS.md](./TASKS.md) for the full phase checklist.
