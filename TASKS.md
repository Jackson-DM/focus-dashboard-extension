# Focus Dashboard — Task Checklist

## Phase 1 — Skeleton ✓

- [x] `manifest.json` — Manifest V3, new tab override, storage permission, options page
- [x] `newtab.html` — Dashboard shell with Header, Health, Work, Follow-ups sections
- [x] `newtab.js` — Dynamic date rendering, `renderTasks()` stub
- [x] `styles.css` — Clean minimal layout, section cards, task list styles
- [x] `options.html` — Settings form for Notion token + database ID
- [x] `options.js` — Save/load credentials via `chrome.storage.local`
- [x] `notion.js` — Stub functions `fetchTasks()` and `updateTaskStatus()`
- [x] Documentation scaffolded (PRD, TASKS, CONTEXT, WORKLOG, README)

## Phase 2 — Settings & Storage ✓

- [x] Save/load credentials (notionToken, notionDatabaseId) via `chrome.storage.local`
- [x] Options page with save confirmation message

## Phase 3 — Notion Integration (Read-Only) ✓

- [x] Implement `fetchTasks()` — POST /v1/databases/:id/query, filter Status != "Done" (fallback: all rows if 400), group by Area into { health, work, followups }
- [x] Route all Notion API calls through `background.js` service worker (CORS fix)
- [x] Wire `fetchTasks()` into `newtab.js` `init()`
- [x] Handle API errors gracefully — missing-creds banner (info style), API failure banner (error style) + console.error
- [x] Cache last-fetched tasks in `chrome.storage.local` (`cachedTasks`) — instant render from cache, then live refresh

## Phase 4 — Write-back ✓

- [x] `handleUpdateTaskStatus()` in `background.js` — PATCH `/v1/pages/:id`, set Status select to "Done" or "Todo"
- [x] `updateTaskStatus(pageId, isDone)` in `notion.js` — sends `NOTION_UPDATE_TASK_STATUS` message to background
- [x] Wire checkbox `change` events in `newtab.js` to call `updateTaskStatus()`
- [x] Optimistic UI — disable checkbox + apply `task-done` class immediately; remove task `<li>` from DOM on success
- [x] Error handling on write — revert checkbox + show red "Failed to update task" banner on failure
- [x] Cache invalidation on successful write — `chrome.storage.local.remove('cachedTasks')`

## Phase 5 — UX Polish ✓

- [x] Show due dates on task items — from Notion `Due` property, formatted "Mon DD" (or "Mon DD, YYYY" for non-current year)
- [x] Sort tasks within each section by due date ascending; undated tasks last
- [x] Refresh button in header — clears cache, re-fetches Notion, re-renders; shows "Syncing…" while in flight
- [x] "Last synced: HH:MM AM/PM" footer — populated from `cachedAt` on first paint, updated after each successful fetch
- [ ] Empty state copy per section ("All clear!") — out of scope for this build
- [ ] Loading skeleton on first paint (no cache) — out of scope for this build
- [ ] Differentiated error copy for 401 / 404 — out of scope for this build

## Final

- [ ] Record Loom walkthrough

---

## Testing Checklist

All manual tests passed on 2026-02-20 against live Notion DB.

### A — Missing credentials banner
1. Open Options, clear token and DB ID, save.
2. Open a new tab.
3. **Expected:** Blue info banner — "Connect Notion in Settings…". No console errors.

### B — Invalid token (401)
1. Set token to a garbage string (e.g. `secret_invalid`), save.
2. Open a new tab.
3. **Expected:** Red error banner — "Failed to load tasks." Console shows HTTP 401 detail from Notion.

### C — Invalid database ID (400 / 404)
1. Set a valid token but a wrong database ID, save.
2. Open a new tab.
3. **Expected:** Red error banner. Console shows HTTP 400 or 404 detail from Notion.

### D — Cache behavior on disconnect
1. Load tasks successfully — tasks appear, "Last synced: HH:MM" shows in footer.
2. Disconnect from the internet (turn off Wi-Fi or use DevTools → Network → Offline).
3. Open a new tab.
4. **Expected:** Cached tasks render instantly from `cachedTasks`. "Last synced" shows the previous sync time. Red error banner appears once the live fetch fails.

### E — Checkbox marks task Done in Notion
1. Load tasks. Check a task's checkbox.
2. **Expected:** Task immediately gets strikethrough + done styling, then disappears from the list within ~1–2 s.
3. Open Notion → confirm the page's Status property reads "Done".
4. Open a new tab → confirm the task does not reappear (filtered out by API).

### F — Due date display and sort order
1. In Notion, set one task's Due to tomorrow, another to next week (same section), leave a third undated.
2. Open a new tab.
3. **Expected:** Tomorrow's task appears first, next week's second, undated task last. Due dates show in small grey text below the task title.

### G — Refresh button + last synced
1. Note the current "Last synced" time in the footer.
2. Click the **Refresh** button in the top-right of the header.
3. **Expected:** Button reads "Syncing…" and is disabled. After the fetch completes, tasks re-render, "Last synced" updates to the current time, and the button returns to "Refresh".
