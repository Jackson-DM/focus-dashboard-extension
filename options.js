// options.js — Settings page logic

const tokenInput = document.getElementById('notion-token');
const dbIdInput  = document.getElementById('notion-db-id');
const saveBtn    = document.getElementById('save-btn');
const statusEl   = document.getElementById('status');

// Load saved values on open
chrome.storage.local.get(['notionToken', 'notionDatabaseId'], (result) => {
  if (result.notionToken)     tokenInput.value = result.notionToken;
  if (result.notionDatabaseId) dbIdInput.value = result.notionDatabaseId;
});

function setStatus(message, type = 'success') {
  statusEl.textContent = message;
  statusEl.className = type;
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = '';
  }, 3000);
}

saveBtn.addEventListener('click', () => {
  const token = tokenInput.value.trim();
  const dbId  = dbIdInput.value.trim();

  if (!token || !dbId) {
    setStatus('Please fill in both fields.', 'error');
    return;
  }

  chrome.storage.local.set(
    { notionToken: token, notionDatabaseId: dbId },
    () => {
      if (chrome.runtime.lastError) {
        setStatus('Error saving settings.', 'error');
        return;
      }
      setStatus('Settings saved!', 'success');
    }
  );
});
