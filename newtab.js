// newtab.js — Focus Dashboard entry point

const CACHE_KEY = 'cachedTasks';

// --- Date ---

function renderDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

// --- Task rendering ---

// Render a list of tasks into a section's <ul>.
// tasks: Array<{ id: string, title: string, done: boolean }>
function renderTasks(sectionId, tasks) {
  const list = document.getElementById(`tasks-${sectionId}`);
  if (!list) return;

  list.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className   = 'task-item task-empty';
    empty.textContent = 'No tasks';
    list.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className  = `task-item${task.done ? ' task-done' : ''}`;
    li.dataset.id = task.id;

    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.checked   = task.done;
    checkbox.className = 'task-checkbox';
    checkbox.addEventListener('change', async () => {
      const newDone = checkbox.checked;
      // Optimistic update
      checkbox.disabled = true;
      if (newDone) li.classList.add('task-done');
      else         li.classList.remove('task-done');

      try {
        await updateTaskStatus(task.id, newDone);
        // Success: remove the task from the DOM and invalidate cache so next open is fresh
        li.remove();
        chrome.storage.local.remove(CACHE_KEY);
      } catch (err) {
        // Revert to original state
        checkbox.checked  = task.done;
        checkbox.disabled = false;
        if (task.done) li.classList.add('task-done');
        else           li.classList.remove('task-done');
        console.error('[newtab.js] Failed to update task:', err);
        showBanner('Failed to update task', 'error');
      }
    });

    const label       = document.createElement('span');
    label.className   = 'task-label';
    label.textContent = task.title;

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });
}

// --- Banner ---

function showBanner(message, type = 'error') {
  const banner = document.getElementById('status-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.className   = `status-banner status-banner--${type}`;
  banner.hidden      = false;
}

function hideBanner() {
  const banner = document.getElementById('status-banner');
  if (!banner) return;
  banner.hidden      = true;
  banner.textContent = '';
  banner.className   = 'status-banner';
}

// --- Cache ---

function readCache() {
  return new Promise((resolve) =>
    chrome.storage.local.get([CACHE_KEY], (result) => resolve(result[CACHE_KEY] ?? null))
  );
}

function writeCache(grouped) {
  chrome.storage.local.set({ [CACHE_KEY]: { tasks: grouped, cachedAt: Date.now() } });
}

// --- Initialisation ---

async function init() {
  renderDate();

  // 1. Render cached tasks immediately for instant first paint
  const cached = await readCache();
  if (cached?.tasks) {
    renderTasks('health',    cached.tasks.health    ?? []);
    renderTasks('work',      cached.tasks.work      ?? []);
    renderTasks('followups', cached.tasks.followups ?? []);
  }

  // 2. Fetch live data from Notion and refresh
  try {
    const grouped = await fetchTasks();
    hideBanner();
    renderTasks('health',    grouped.health);
    renderTasks('work',      grouped.work);
    renderTasks('followups', grouped.followups);
    writeCache(grouped);
  } catch (err) {
    if (err.type === 'missing_credentials') {
      showBanner(
        'Connect Notion in Settings — right-click the extension icon and choose "Options", or visit chrome://extensions → Focus Dashboard → Details → Extension options.',
        'info'
      );
    } else {
      console.error('[newtab.js] Failed to load tasks from Notion:', err);
      showBanner('Failed to load tasks. Check the DevTools console for details.', 'error');
    }
    // If no cache exists yet, explicitly show empty sections
    if (!cached?.tasks) {
      renderTasks('health',    []);
      renderTasks('work',      []);
      renderTasks('followups', []);
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
