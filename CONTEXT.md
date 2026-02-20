# Focus Dashboard — Project Context

## What this is

A Chrome extension that replaces the new tab page with a personal productivity dashboard. Tasks are sourced from a private Notion database and displayed in three fixed categories: **Health**, **Work**, and **Follow-ups**.

## Why it exists

The goal is zero-friction daily orientation. Instead of opening Notion manually or keeping a tab pinned, every new tab becomes a passive reminder of what matters today.

## Key constraints

- **Manifest V3** — required by Chrome for all new extensions. Service workers replace background pages; `fetch()` from content/page scripts must respect CORS. Notion's API blocks direct `fetch()` from extension pages — all HTTP calls are routed through the background service worker (`background.js`) which holds `host_permissions` for `https://api.notion.com/*`.
- **No backend** — all data flows directly between the extension and the Notion API. Credentials live in `chrome.storage.local` (encrypted by the browser profile).
- **Single database** — MVP targets one Notion database with a Category select property. Multi-DB support is explicitly out of scope.

## Notion API notes

- Base URL: `https://api.notion.com/v1/`
- Auth header: `Authorization: Bearer <token>`
- API version header: `Notion-Version: 2022-06-28`
- Query a database: `POST /v1/databases/:id/query`
- Update a page: `PATCH /v1/pages/:id`
- Notion's API blocks CORS for browser requests. Direct `fetch()` from extension pages (newtab, options) also fails. Fix: route all Notion HTTP calls through `background.js` (MV3 service worker) with `host_permissions: ["https://api.notion.com/*"]`. Service workers are exempt from the same CORS restrictions as page scripts.

## File responsibilities

| File          | Role                                                                      |
|---------------|---------------------------------------------------------------------------|
| manifest.json | Extension config, permissions, page overrides                             |
| background.js | MV3 service worker — HTTP proxy for Notion API (CORS workaround)          |
| newtab.html   | Dashboard markup shell                                                    |
| newtab.js     | UI logic — date, task rendering, checkbox events, refresh, last-synced    |
| styles.css    | Visual design                                                             |
| options.html  | Settings page markup                                                      |
| options.js    | Credential persistence via chrome.storage.local                           |
| notion.js     | Notion API data layer — fetchTasks, updateTaskStatus, sorting             |

## Decisions log

| Date       | Decision                                              | Reason                                      |
|------------|-------------------------------------------------------|---------------------------------------------|
| 2026-02-19 | Initial plan: no background service worker           | Believed Notion fetch could run in page context |
| 2026-02-19 | Reversed: all Notion calls moved to background.js    | Direct fetch() from newtab blocked by CORS on api.notion.com; service workers with host_permissions are exempt |
| 2026-02-19 | Three fixed categories (Health, Work, Follow-ups)    | Matches existing Notion DB structure         |
| 2026-02-19 | chrome.storage.local for credentials                 | Simplest secure option within MV3            |
| 2026-02-19 | Area (select) instead of PRD's Category; Status (select) instead of Done (checkbox) | Reflects actual Notion DB schema; Status filter falls back to unfiltered if property absent (400 response) |
| 2026-02-19 | cachedTasks key in chrome.storage.local              | Instant first paint; stores { tasks: {health,work,followups}, cachedAt: timestamp } |
| 2026-02-20 | Optimistic UI for checkbox: remove li on success, revert on failure | Fastest perceived response; cache invalidated on success so next open is fresh |
| 2026-02-20 | Due date sort: ISO string comparison (YYYY-MM-DD) in notion.js | String comparison is correct for this format; keeps sorting logic out of newtab.js |
| 2026-02-20 | Refresh clears cache before re-fetching              | Prevents stale cache from rendering during Syncing… state |

## Current Status

Phases 1–5 complete. Extension is fully functional and manually tested.

- **Read:** `fetchTasks()` queries Notion via service worker, filters Status != "Done", groups by Area, sorts by Due, caches result.
- **Write:** `updateTaskStatus()` PATCHes Notion page Status via service worker; optimistic UI removes task on success, reverts on failure.
- **UX:** Due dates rendered per task; tasks sorted by due ascending (nulls last); Refresh button; "Last synced" footer.
- **Error handling:** missing-creds info banner, API error red banner, write-failure red banner with console detail.

## Next Step

Record Loom walkthrough.
