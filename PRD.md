# Focus Dashboard — Product Requirements Document

## Goal

Replace the Chrome new tab page with a personal productivity dashboard that surfaces daily priorities pulled directly from a Notion database. The dashboard is private, zero-friction, and requires no separate app to open.

---

## Problem

Important tasks live in Notion, but opening Notion to check them adds friction. A passive glance at a new tab should be enough to stay oriented throughout the day.

---

## MVP Scope

The MVP is a Chrome extension that:

1. Overrides the new tab page with a clean dashboard.
2. Displays the current date.
3. Shows tasks from a single Notion database, grouped into three categories: **Health**, **Work**, and **Follow-ups**.
4. Allows the user to mark tasks complete directly from the dashboard (syncs back to Notion).
5. Stores the Notion integration token and database ID securely via `chrome.storage.local`.

### Out of scope for MVP
- Multiple Notion databases
- Push notifications / reminders
- Drag-and-drop task reordering
- Dark mode toggle
- Mobile / Firefox support

---

## Architecture

```
Chrome Extension (Manifest V3)
│
├── newtab.html / newtab.js / styles.css
│     UI layer — renders date, task sections, handles checkbox events
│
├── notion.js
│     Data layer — fetches and updates tasks via Notion REST API
│     Called by newtab.js; runs in the page context (no background service worker needed for MVP)
│
├── options.html / options.js
│     Settings UI — stores Notion credentials via chrome.storage.local
│
└── manifest.json
      Declares new tab override, options page, and storage permission
```

### Data Flow

1. `newtab.js` calls `fetchTasks()` from `notion.js` on page load.
2. `notion.js` reads credentials from `chrome.storage.local`, calls the Notion API, and returns structured task data.
3. `newtab.js` renders tasks into the three section lists.
4. When a checkbox is toggled, `newtab.js` calls `updateTaskStatus()` with the page ID and new state.

### Notion Database Schema (expected)

| Property   | Type     | Notes                              |
|------------|----------|------------------------------------|
| Name       | Title    | Task title                         |
| Done       | Checkbox | Completion state                   |
| Category   | Select   | One of: Health, Work, Follow-ups   |

---

## Success Criteria

- [ ] Opening a new tab shows the dashboard within < 1 second on a normal connection.
- [ ] Tasks load from Notion and display correctly in their categories.
- [ ] Checking a task in the dashboard marks it done in Notion.
- [ ] Credentials are never exposed in source code or the UI.
