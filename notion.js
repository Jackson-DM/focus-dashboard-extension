// notion.js — Notion API integration layer
//
// Property mapping (Phase 3 adaptation note):
//   The original PRD defined "Category" (select) + "Done" (checkbox).
//   This implementation targets the actual database schema:
//     • Name   (title)  — task title
//     • Area   (select) — section grouping; expected values: "Health", "Work", "Follow-ups"
//     • Due    (date)   — optional due date (fetched but not used for filtering in Phase 3)
//     • Status (select) — completion state; tasks where Status == "Done" are excluded.
//                         If the "Status" property does not exist, all rows are fetched (fallback mode).
//
// Fetch architecture:
//   Direct fetch() from extension pages is blocked by CORS on api.notion.com.
//   All HTTP calls are proxied through background.js (MV3 service worker) via
//   chrome.runtime.sendMessage({ type: 'NOTION_QUERY_TASKS', body }).
//   background.js reads credentials from storage and does the actual fetch.
//   notion.js retains all parsing and grouping logic.

// Map an Area select value to the dashboard section key.
// Normalises casing and punctuation so "Follow-ups", "Follow ups", "followups" all match.
function areaToSectionKey(area) {
  if (!area) return null;
  const n = area.toLowerCase().replace(/[\s\-_]/g, '');
  if (n === 'health')         return 'health';
  if (n === 'work')           return 'work';
  if (n.startsWith('follow')) return 'followups';
  return null;
}

// Parse a Notion page object into a minimal task record.
function parsePage(page) {
  const p = page.properties || {};
  return {
    id:     page.id,
    title:  p.Name?.title?.[0]?.plain_text ?? '(Untitled)',
    area:   p.Area?.select?.name          ?? null,
    due:    p.Due?.date?.start            ?? null,
    status: p.Status?.select?.name        ?? null,
    done:   false, // all fetched tasks are non-done (filtered); checkbox write is Phase 4
  };
}

// Send a query body to the background service worker.
// Returns the raw results array on success.
// Throws an Error (with .status if available) on any failure.
function _queryDatabase(body) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'NOTION_QUERY_TASKS', body }, (response) => {
      if (chrome.runtime.lastError) {
        // Service worker not running or message channel closed
        const err  = new Error(chrome.runtime.lastError.message);
        err.type   = 'api_error';
        reject(err);
        return;
      }
      if (!response || !response.ok) {
        const err  = new Error(response?.error ?? 'Unknown error from background');
        err.status = response?.status ?? null;
        err.detail = response?.detail ?? null;
        reject(err);
        return;
      }
      resolve(response.results);
    });
  });
}

/**
 * Fetch tasks from the configured Notion database.
 *
 * Strategy:
 *   1. Read credentials from chrome.storage.local to fail fast with a clean error type.
 *   2. Send NOTION_QUERY_TASKS to background.js with a Status != "Done" filter body.
 *   3. If background returns a 400 (property not found), retry with an empty body (fallback mode).
 *   4. Parse pages, group by Area into { health, work, followups }.
 *
 * Throws an Error with a .type property:
 *   'missing_credentials'  — notionToken or notionDatabaseId not set in storage
 *   'api_error'            — Notion returned a non-recoverable error
 *
 * @returns {Promise<{ health: Task[], work: Task[], followups: Task[] }>}
 */
async function fetchTasks() {
  // 1. Check credentials exist locally for a clean missing_credentials error in the UI
  const { notionToken, notionDatabaseId } = await new Promise((resolve) =>
    chrome.storage.local.get(['notionToken', 'notionDatabaseId'], resolve)
  );

  if (!notionToken || !notionDatabaseId) {
    const err = new Error('Notion credentials not configured.');
    err.type  = 'missing_credentials';
    throw err;
  }

  // 2. Query with Status filter; fall back to unfiltered if Status property absent
  let results;
  try {
    results = await _queryDatabase({
      filter: {
        property: 'Status',
        select:   { does_not_equal: 'Done' },
      },
    });
  } catch (firstErr) {
    if (firstErr.status === 400) {
      // Status property probably absent in this database — retry without filter
      console.warn('[notion.js] Status filter rejected (400) — retrying without filter (fallback mode).');
      try {
        results = await _queryDatabase({});
      } catch (retryErr) {
        retryErr.type = 'api_error';
        throw retryErr;
      }
    } else {
      firstErr.type = 'api_error';
      throw firstErr;
    }
  }

  // 3. Parse pages and group by Area
  const grouped = { health: [], work: [], followups: [] };
  for (const page of results) {
    const task = parsePage(page);
    const key  = areaToSectionKey(task.area);
    if (key) {
      grouped[key].push({ id: task.id, title: task.title, done: task.done });
    }
    // Tasks with no Area or an unrecognised Area value are silently skipped
  }

  return grouped;
}

/**
 * Update the Status select of a Notion page to "Done" or "Todo".
 *
 * @param {string}  pageId
 * @param {boolean} isDone  true → "Done", false → "Todo"
 * @returns {Promise<void>}  Resolves on success, rejects with Error on failure.
 */
function updateTaskStatus(pageId, isDone) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'NOTION_UPDATE_TASK_STATUS', pageId, isDone }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || !response.ok) {
        const err    = new Error(response?.error ?? 'Unknown error from background');
        err.status   = response?.status ?? null;
        err.detail   = response?.detail ?? null;
        reject(err);
        return;
      }
      resolve();
    });
  });
}
