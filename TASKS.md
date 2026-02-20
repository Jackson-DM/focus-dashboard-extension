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

## Phase 4 — Write-back

- [ ] Implement `updateTaskStatus()` in `background.js` — PATCH `/v1/pages/:id`, set Status select to "Done" (or Done checkbox, depending on DB schema)
- [ ] Wire checkbox `change` events in `newtab.js` to call `updateTaskStatus()`
- [ ] Optimistic UI — apply `task-done` class immediately on toggle, revert if API call fails
- [ ] Error handling on write — surface a transient banner or inline indicator on failure

## Phase 5 — UX Polish

- [ ] Show due dates on task items (from `Due` property)
- [ ] Sort tasks within each section (e.g. by due date ascending, undated last)
- [ ] Empty state copy per section ("All clear!")
- [ ] Loading skeleton while tasks fetch on first paint (no cache yet)
- [ ] Refresh button or auto-refresh interval
- [ ] Improve error copy for common failures (401 bad token, 404 wrong DB ID)
- [ ] Subtle strikethrough animation on task completion

## Final

- [ ] Record Loom walkthrough

---

## Tomorrow — Session Start

- [ ] Reload extension in Chrome, open new tab, confirm live tasks render correctly
- [ ] Phase 4: implement `updateTaskStatus()` write-back (PATCH Notion page)
- [ ] Phase 4: wire checkbox events + optimistic UI with rollback on failure
- [ ] Phase 4: confirm Status property name matches DB ("Done" select vs checkbox)
- [ ] Phase 5: UX polish — due dates, sorting, empty states, better error copy, refresh button
- [ ] Final: record Loom
