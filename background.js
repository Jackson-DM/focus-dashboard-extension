// background.js — MV3 service worker
//
// Acts as a fetch proxy for the Notion API.
// Extension pages (newtab, options) cannot call api.notion.com directly due to CORS;
// service workers can, provided host_permissions includes https://api.notion.com/*.
//
// Supported message types:
//   { type: 'NOTION_QUERY_TASKS', body: Object }
//     → reads credentials from chrome.storage.local, POSTs to /databases/:id/query
//     → responds with { ok: true, results: Array }
//          or        { ok: false, error: string, status: number|null, detail: Object }

const NOTION_API     = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'NOTION_QUERY_TASKS') {
    handleQueryTasks(message.body ?? {}).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
});

async function handleQueryTasks(body) {
  // Read credentials from storage (keys match options.js)
  const { notionToken, notionDatabaseId } = await new Promise((resolve) =>
    chrome.storage.local.get(['notionToken', 'notionDatabaseId'], resolve)
  );

  if (!notionToken || !notionDatabaseId) {
    return { ok: false, error: 'missing_credentials', status: null, detail: {} };
  }

  try {
    const res = await fetch(`${NOTION_API}/databases/${notionDatabaseId}/query`, {
      method:  'POST',
      headers: {
        'Authorization':  `Bearer ${notionToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok:     false,
        error:  data.message || `HTTP ${res.status}`,
        status: res.status,
        detail: data,
      };
    }

    return { ok: true, results: data.results ?? [] };

  } catch (err) {
    // Network-level failure (no response)
    return { ok: false, error: err.message ?? 'Network error', status: null, detail: {} };
  }
}
