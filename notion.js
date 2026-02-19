// notion.js — Notion API integration layer
// Stubs only — full implementation in a future phase.

/**
 * Fetch tasks from the configured Notion database.
 * Returns an array of task objects grouped by category.
 *
 * @returns {Promise<{ health: Task[], work: Task[], followups: Task[] }>}
 */
async function fetchTasks() {
  // TODO: read notionToken + notionDatabaseId from chrome.storage.local
  // TODO: call Notion API via fetch() with proper auth headers
  // TODO: map Notion page properties to Task objects
  // TODO: group tasks by category property
  console.log('[notion.js] fetchTasks() — not yet implemented');
  return { health: [], work: [], followups: [] };
}

/**
 * Toggle the completion status of a task in Notion.
 *
 * @param {string} pageId - The Notion page ID for the task.
 * @param {boolean} done  - The new completion state.
 * @returns {Promise<void>}
 */
async function updateTaskStatus(pageId, done) {
  // TODO: read notionToken from chrome.storage.local
  // TODO: PATCH /v1/pages/:pageId with updated checkbox property
  console.log(`[notion.js] updateTaskStatus(${pageId}, ${done}) — not yet implemented`);
}
