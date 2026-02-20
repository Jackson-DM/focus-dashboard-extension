# Focus Dashboard — Work Log

## 2026-02-19

T+00:00 – Project scaffold generated using Claude Code.

T+00:20 – Loaded extension in Chrome via Developer Mode and verified New Tab override. Focus Dashboard renders correctly with date and Health/Work/Follow-up sections. Phase 1 (Extension Skeleton) complete.

T+00:40 – Verified Phase 2 (Options Page). Save, load, and confirmation message all working. Credentials persist via chrome.storage.local. Phase 2 complete.

T+01:00 – Phase 3 READ-ONLY implemented (initial — direct fetch, later found CORS issue).
T+01:20 – CORS patch: moved Notion fetch into background.js (MV3 service worker). manifest.json gains background.service_worker + host_permissions. notion.js now sends chrome.runtime.sendMessage({type:'NOTION_QUERY_TASKS',body}) instead of direct fetch(). background.js is a thin HTTP proxy; notion.js retains all parsing/grouping logic. newtab.js unchanged. notion.js: fetchTasks() queries Notion with Status != "Done" filter (falls back to unfiltered on 400). Maps Area select → health/work/followups. newtab.js: init() loads from cachedTasks cache for instant paint, fetches live data, writes cache on success. Missing-creds info banner and API-error red banner added. newtab.html: status-banner div added. styles.css: banner styles added. updateTaskStatus() and checkbox wiring deferred to Phase 4.

## 2026-02-20

T+00:00 – Session start. Phase 3 verified working against live Notion DB. Tasks render correctly on new tab; cache gives instant first paint; live refresh updates silently. Phase 3 shipped.

T+00:30 – Phase 4 complete: Notion write-back implemented.
- background.js: new NOTION_UPDATE_TASK_STATUS handler — reads notionToken from storage, PATCHes /v1/pages/:id with Status select = "Done" or "Todo".
- notion.js: updateTaskStatus(pageId, isDone) sends message to background, rejects on error.
- newtab.js: checkbox change handler — optimistic UI (task-done class + disabled checkbox immediately); on success removes li from DOM and clears cachedTasks; on failure reverts checkbox state and shows red banner.

T+01:30 – Phase 5 complete: UX polish shipped.
- notion.js: `due` field now included in grouped task objects; each section sorted by due date ascending (ISO string compare; nulls last).
- newtab.js: formatDue() formats YYYY-MM-DD → "Mon DD" (appends year if not current); renderTasks wraps label + due in .task-info div; writeCache now returns cachedAt; renderLastSynced() populates footer from cachedAt timestamp.
- newtab.html: header-top flex wrapper + Refresh button; dashboard-footer with #last-synced.
- styles.css: header-top, refresh-btn (hover + disabled), task-info, task-due, dashboard-footer, last-synced; task-item changed to align-items:flex-start, checkbox gets margin-top:2px.

T+02:00 – Manual testing complete — all checks A–G passed:
A. Missing-credentials info banner — ✓
B. Invalid token (401) red error banner — ✓
C. Invalid database ID (400/404) red error banner — ✓
D. Cache renders on disconnect; live fetch error banner shown — ✓
E. Checkbox marks Notion page Done; task disappears; confirmed in Notion — ✓
F. Due dates displayed; sort order correct (earliest first, undated last) — ✓
G. Refresh button clears cache, re-fetches, updates last-synced footer — ✓

T+02:30 – Documentation updated: TASKS.md (Phase 4/5 checked, Testing Checklist added), CONTEXT.md (CORS notes corrected, decisions log expanded, status updated), WORKLOG.md finalised. No console errors on the happy path. Project feature-complete.
