(() => {
  'use strict';

  const bar = document.querySelector('[data-inline-editor]');
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (!bar || !csrfMeta) return;

  const csrfToken = csrfMeta.getAttribute('content') || '';
  const fields = Array.from(document.querySelectorAll('[data-edit]'));
  if (!fields.length) return;

  const toggleButton = bar.querySelector('[data-edit-toggle]');
  const saveButton = bar.querySelector('[data-edit-save]');
  const publishButton = bar.querySelector('[data-edit-publish]');
  const reloadButton = bar.querySelector('[data-edit-reload]');
  const message = bar.querySelector('[data-edit-message]');
  const original = new Map();
  let editing = bar.dataset.editing === 'true';
  let dirty = false;
  let saving = false;

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const readField = (field) => normalize(field.innerText || field.textContent);

  const setMessage = (text) => {
    if (message) message.textContent = text;
  };

  const refreshDirty = () => {
    dirty = fields.some((field) => {
      const path = field.dataset.edit;
      if (!original.has(path)) return false;
      return readField(field) !== original.get(path);
    });
    saveButton.disabled = !dirty || saving;
    bar.dataset.dirty = dirty ? 'true' : 'false';
    if (dirty) setMessage('Unsaved changes. Save the draft when you are ready.');
  };

  const setEditing = (next) => {
    editing = next;
    bar.dataset.editing = next ? 'true' : 'false';
    document.body.classList.toggle('is-inline-editing', next);
    toggleButton.textContent = next ? 'Stop editing' : 'Start editing';
    toggleButton.setAttribute('aria-pressed', next ? 'true' : 'false');
    saveButton.hidden = !next;
    reloadButton.hidden = !next;
    saveButton.disabled = !dirty || saving;

    fields.forEach((field) => {
      if (next) {
        field.setAttribute('contenteditable', 'true');
        field.setAttribute('spellcheck', 'true');
      } else {
        field.removeAttribute('contenteditable');
        field.removeAttribute('spellcheck');
      }
    });

    if (next) {
      setMessage('Editing the draft. Highlighted text can be changed. Nothing is public until you publish.');
    } else if (dirty) {
      setMessage('You still have unsaved changes. Start editing again to save them, or reload the draft to discard them.');
    } else {
      setMessage('Read-only preview. Start editing to change text, or publish the saved draft.');
    }
  };

  const snapshot = () => {
    fields.forEach((field) => {
      original.set(field.dataset.edit, readField(field));
    });
  };

  const collectChanges = () => {
    const byPath = new Map();
    fields.forEach((field) => {
      const path = field.dataset.edit;
      const value = readField(field);
      if (original.get(path) !== undefined && value !== original.get(path)) {
        byPath.set(path, value);
      }
    });
    return Array.from(byPath, ([path, value]) => ({ path, value }));
  };

  const post = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ _csrf: csrfToken, ...body }),
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok || !data.ok) {
      if (response.status === 403) {
        throw new Error('Your session has expired. Reload the page and sign in again.');
      }
      throw new Error(data.error || 'That could not be saved. Please try again.');
    }
    return data;
  };

  const save = async () => {
    if (saving) return false;
    const changes = collectChanges();
    if (!changes.length) {
      setMessage('There are no unsaved changes.');
      return true;
    }
    saving = true;
    saveButton.disabled = true;
    setMessage('Saving to the draft…');
    try {
      await post('/admin/inline-save', { changes });
      changes.forEach((change) => original.set(change.path, change.value));
      dirty = false;
      saving = false;
      saveButton.disabled = true;
      bar.dataset.dirty = 'false';
      setMessage('Saved to the draft. Publish when you are ready for it to go live.');
      return true;
    } catch (error) {
      saving = false;
      saveButton.disabled = false;
      setMessage(error.message);
      return false;
    }
  };

  toggleButton.addEventListener('click', () => {
    if (editing && dirty) {
      if (!window.confirm('Stop editing and discard the unsaved changes on this page?')) return;
      window.location.reload();
      return;
    }
    setEditing(!editing);
  });

  saveButton.addEventListener('click', save);

  publishButton.addEventListener('click', async () => {
    if (!window.confirm('Publish the draft now? These changes will become visible to everyone.')) return;
    if (dirty && !(await save())) return;
    publishButton.disabled = true;
    setMessage('Publishing…');
    try {
      await post('/admin/publish', {});
      window.location.href = '/';
    } catch (error) {
      publishButton.disabled = false;
      setMessage(error.message);
    }
  });

  reloadButton.addEventListener('click', () => {
    if (dirty && !window.confirm('Reload the draft and discard your unsaved changes?')) return;
    window.location.reload();
  });

  fields.forEach((field) => {
    field.addEventListener('input', refreshDirty);
    field.addEventListener('paste', (event) => {
      if (!editing) return;
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
    field.addEventListener('keydown', (event) => {
      if (!editing) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        field.blur();
      }
      if (event.key === 'Escape') {
        field.blur();
      }
    });
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!editing) return;
      const field = event.target.closest?.('[data-edit]');
      if (!field) return;
      if (field.closest('a, summary, button')) event.preventDefault();
    },
    true,
  );

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  snapshot();
  setEditing(editing);
})();
