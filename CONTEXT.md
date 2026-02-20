# Focus Dashboard — Project Context

## What this is

A Chrome extension that replaces the new tab page with a personal productivity dashboard. Tasks are sourced from a private Notion database and displayed in three fixed categories: **Health**, **Work**, and **Follow-ups**.

## Why it exists

The goal is zero-friction daily orientation. Instead of opening Notion manually or keeping a tab pinned, every new tab becomes a passive reminder of what matters today.

## Key constraints

- **Manifest V3** — required by Chrome for all new extensions. Service workers replace background pages; `fetch()` from content/page scripts must respect CORS. Notion's API allows direct browser `fetch()` with proper CORS headers, so no proxy is needed for MVP.
- **No backend** — all data flows directly between the extension and the Notion API. Credentials live in `chrome.storage.local` (encrypted by the browser profile).
- **Single database** — MVP targets one Notion database with a Category select property. Multi-DB support is explicitly out of scope.

## Notion API notes

- Base URL: `https://api.notion.com/v1/`
- Auth header: `Authorization: Bearer <token>`
- API version header: `Notion-Version: 2022-06-28`
- Query a database: `POST /v1/databases/:id/query`
- Update a page: `PATCH /v1/pages/:id`
- Notion blocks CORS for browser requests by default — but this extension runs in a privileged context (Chrome extension page, not a normal web page), so direct `fetch()` works.

## File responsibilities

| File         | Role                                              |
|--------------|---------------------------------------------------|
| manifest.json | Extension config, permissions, page overrides    |
| newtab.html  | Dashboard markup shell                            |
| newtab.js    | UI logic — date, task rendering, event wiring     |
| styles.css   | Visual design                                     |
| options.html | Settings page markup                              |
| options.js   | Credential persistence via chrome.storage.local   |
| notion.js    | Notion API data layer (fetch + update)            |

## Decisions log

| Date       | Decision                                              | Reason                                      |
|------------|-------------------------------------------------------|---------------------------------------------|
| 2026-02-19 | No background service worker in MVP                  | Notion fetch can run in page context; simpler |
| 2026-02-19 | Three fixed categories (Health, Work, Follow-ups)    | Matches existing Notion DB structure         |
| 2026-02-19 | chrome.storage.local for credentials                 | Simplest secure option within MV3            |
| 2026-02-19 | Area (select) instead of PRD's Category; Status (select) instead of Done (checkbox) | Reflects actual Notion DB schema; Status filter falls back to unfiltered if property absent |
| 2026-02-19 | cachedTasks key in chrome.storage.local              | Instant first paint; stores { tasks, cachedAt } |
| 2026-02-19 | Notion fetch moved to background.js service worker   | Direct fetch() from newtab page context blocked by CORS on api.notion.com; service workers are exempt with host_permissions |

## Current Status
Phase 3 (READ-ONLY) complete.
fetchTasks() implemented: queries Notion, filters Status != "Done", groups by Area, caches result.
Missing-creds and API-error banners implemented in newtab.js.
updateTaskStatus() and checkbox wiring deferred to Phase 4.

## Next Step
Phase 4: Polish (loading skeleton, empty-state copy, task count badges) and Phase 3 write path (updateTaskStatus + checkbox wiring).
