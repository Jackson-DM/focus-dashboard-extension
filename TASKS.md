# Focus Dashboard — Task Checklist

## Phase 1 — Skeleton (current)

- [x] `manifest.json` — Manifest V3, new tab override, storage permission, options page
- [x] `newtab.html` — Dashboard shell with Header, Health, Work, Follow-ups sections
- [x] `newtab.js` — Dynamic date rendering, `renderTasks()` stub
- [x] `styles.css` — Clean minimal layout, section cards, task list styles
- [x] `options.html` — Settings form for Notion token + database ID
- [x] `options.js` — Save/load credentials via `chrome.storage.local`
- [x] `notion.js` — Stub functions `fetchTasks()` and `updateTaskStatus()`
- [x] Documentation scaffolded (PRD, TASKS, CONTEXT, WORKLOG, README)

## Phase 2 — Settings & Storage

- [ ] Validate token format on save (must start with `secret_`)
- [ ] Show masked token on re-open (e.g., `secret_••••••••••`)
- [ ] Add "Test Connection" button that makes a minimal Notion API call to verify credentials
- [ ] Display connection status indicator on the dashboard header

## Phase 3 — Notion Integration (READ-ONLY scope complete)

- [x] Implement `fetchTasks()` — POST /v1/databases/:id/query, filter Status != "Done" (fallback: all rows), group by Area into { health, work, followups }
- [ ] Implement `updateTaskStatus()` — PATCH Notion page to toggle Done checkbox (deferred to Phase 4)
- [x] Wire `fetchTasks()` into `newtab.js` `init()`
- [ ] Wire checkbox `change` events to `updateTaskStatus()` (deferred to Phase 4)
- [x] Handle API errors gracefully — missing creds banner (info style), API failure banner (error style) + console.error
- [x] Cache last-fetched tasks in `chrome.storage.local` — instant render from cache, then live refresh

## Phase 4 — Polish

- [ ] Loading skeleton while tasks fetch
- [ ] Empty state copy per section ("All clear!")
- [ ] Task count badge per section header
- [ ] Keyboard shortcut to open settings
- [ ] Subtle animation on task completion
- [ ] Investigate: strikethrough animation for completed tasks
