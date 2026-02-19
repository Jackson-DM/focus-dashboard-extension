// newtab.js — Focus Dashboard entry point

// Render the current date into the header
function renderDate() {
  const el = document.getElementById('current-date');
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Render a list of tasks into a given section's <ul>
// tasks: Array<{ id: string, title: string, done: boolean }>
function renderTasks(sectionId, tasks) {
  const list = document.getElementById(`tasks-${sectionId}`);
  if (!list) return;

  list.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-item task-empty';
    empty.textContent = 'No tasks';
    list.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' task-done' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.className = 'task-checkbox';
    // Status toggling will be wired up once Notion integration is active
    checkbox.addEventListener('change', () => {
      console.log(`Task "${task.title}" toggled — Notion sync coming soon.`);
    });

    const label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.title;

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });
}

// Initialise the dashboard
async function init() {
  renderDate();

  // Placeholder data — will be replaced by live Notion fetch
  renderTasks('health', []);
  renderTasks('work', []);
  renderTasks('followups', []);
}

document.addEventListener('DOMContentLoaded', init);
