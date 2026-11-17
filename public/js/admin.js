/* =========================================================
   Rock Bottom – The Way Back
   Administrator dashboard behaviour
   ========================================================= */

(() => {
  'use strict';

  const body = document.body;
  const sidebar = document.querySelector('[data-admin-sidebar]');
  const menuButton = document.querySelector('[data-admin-menu]');
  const uploadLimit = 8 * 1024 * 1024;
  const uploadCountLimit = 10;

  /* ------------------------------------------------------------------
     Toast feedback
     ------------------------------------------------------------------ */

  let toastTimer = null;

  function toast(message) {
    let element = document.querySelector('.admin-toast');
    if (!element) {
      element = document.createElement('div');
      element.className = 'admin-toast';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      element.classList.remove('is-visible');
    }, 2600);
  }

  /* ------------------------------------------------------------------
     Mobile sidebar
     ------------------------------------------------------------------ */

  let overlay = null;

  function sidebarIsOpen() {
    return Boolean(sidebar && sidebar.classList.contains('is-open'));
  }

  function openSidebar() {
    if (!sidebar || !menuButton) return;
    ensureOverlay();
    sidebar.classList.add('is-open');
    overlay?.classList.add('is-visible');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close admin menu');
    body.classList.add('admin-nav-open');
    sidebar.querySelector('.admin-nav a')?.focus({ preventScroll: true });
  }

  function closeSidebar(returnFocus = false) {
    if (!sidebar || !menuButton) return;
    sidebar.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open admin menu');
    body.classList.remove('admin-nav-open');
    if (returnFocus) menuButton.focus({ preventScroll: true });
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'admin-sidebar-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () => closeSidebar(true));
    body.appendChild(overlay);
  }

  if (menuButton && sidebar) {
    ensureOverlay();
    menuButton.addEventListener('click', () => {
      if (sidebarIsOpen()) closeSidebar(true);
      else openSidebar();
    });

    // Any link in the drawer navigates away, so close it behind us.
    sidebar.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeSidebar();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sidebarIsOpen()) {
        closeSidebar(true);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && sidebarIsOpen()) closeSidebar();
    });
  }

  /* ------------------------------------------------------------------
     Repeaters
     ------------------------------------------------------------------ */

  function rowsIn(container) {
    return Array.from(container.querySelectorAll(':scope > [data-repeater-row]'));
  }

  function nextIndex(container) {
    return rowsIn(container).reduce((highest, row) => {
      const index = Number(row.dataset.index);
      return Number.isFinite(index) && index >= highest ? index + 1 : highest;
    }, 0);
  }

  function refreshRowNumbers(container) {
    rowsIn(container).forEach((row, position) => {
      const label = row.querySelector('[data-row-number]');
      if (label) label.textContent = String(position + 1);
    });
  }

  function addRow(button) {
    const container = document.getElementById(button.dataset.addRow);
    const template = document.getElementById(button.dataset.template);
    if (!container || !template) return;

    const fragment = template.content.cloneNode(true);
    const index = nextIndex(container);
    fragment.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        if (attribute.value.includes('__INDEX__')) {
          element.setAttribute(attribute.name, attribute.value.replaceAll('__INDEX__', String(index)));
        }
      });
      if (element.namespaceURI === 'http://www.w3.org/2000/svg') {
        // Icons are cloned nodes; no index placeholders inside them.
      }
    });

    // Text placeholders such as legends or labels.
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      if (node.nodeValue?.includes('__INDEX__')) {
        node.nodeValue = node.nodeValue.replaceAll('__INDEX__', String(index));
      }
    });

    const newRow = fragment.querySelector('[data-repeater-row]');
    if (!newRow) return;
    newRow.dataset.index = String(index);
    container.appendChild(fragment);
    refreshRowNumbers(container);

    newRow.classList.add('is-new');
    window.setTimeout(() => newRow.classList.remove('is-new'), 1200);

    const firstField = newRow.querySelector('input, textarea, select');
    if (firstField) {
      newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstField.focus({ preventScroll: true });
    }
    toast('Added a new row at the bottom.');
  }

  function removeRow(button) {
    const row = button.closest('[data-repeater-row]');
    const container = row?.parentElement;
    if (!row || !container) return;
    row.remove();
    refreshRowNumbers(container);
    toast('Row removed. Save the draft to keep this change.');
  }

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-row]');
    if (addButton) {
      event.preventDefault();
      addRow(addButton);
      return;
    }

    const removeButton = event.target.closest('[data-remove-row]');
    if (removeButton) {
      event.preventDefault();
      removeRow(removeButton);
    }
  });

  document.querySelectorAll('.admin-repeater').forEach(refreshRowNumbers);

  /* ------------------------------------------------------------------
     Image previews
     ------------------------------------------------------------------ */

  function previewFor(input) {
    const id = input.dataset.previewFor;
    return id ? document.getElementById(`${id}-preview`) : null;
  }

  function updatePreview(input) {
    const image = previewFor(input);
    if (!image) return;
    const value = input.value.trim();
    if (!value) {
      image.removeAttribute('src');
      return;
    }
    image.src = value;
  }

  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-image-input]');
    if (input) updatePreview(input);
  });

  document.addEventListener(
    'error',
    (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.matches('[data-image-preview]')) {
        image.removeAttribute('src');
      }
    },
    true,
  );

  /* ------------------------------------------------------------------
     Colour fields
     ------------------------------------------------------------------ */

  const paletteKeys = ['background', 'surface', 'surfaceSoft', 'ink', 'muted', 'accent', 'sage', 'paper'];

  function syncColour(input) {
    const field = input.closest('.colour-field');
    const label = field?.querySelector('span');
    if (label) label.textContent = input.value.toUpperCase();

    const match = /^theme\[(\w+)\]$/.exec(input.name);
    if (!match) return;
    const swatches = document.querySelectorAll('.palette-preview span');
    const position = paletteKeys.indexOf(match[1]);
    if (position >= 0 && swatches[position]) {
      swatches[position].style.background = input.value;
    }
  }

  document.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === 'color') {
      syncColour(event.target);
    }
  });

  document.querySelectorAll('input[type="color"]').forEach(syncColour);

  /* ------------------------------------------------------------------
     Line counters
     ------------------------------------------------------------------ */

  function countLines(textarea) {
    const total = textarea.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;
    const target = document.querySelector(
      `[data-line-count-for="${textarea.id}"]`,
    );
    if (target) target.textContent = String(total);
  }

  document.querySelectorAll('[data-count-lines]').forEach((textarea) => {
    countLines(textarea);
    textarea.addEventListener('input', () => countLines(textarea));
  });

  /* ------------------------------------------------------------------
     Copy paths
     ------------------------------------------------------------------ */

  function legacyCopy(value) {
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    helper.remove();
    return copied;
  }

  async function copyPath(button) {
    const value = button.dataset.copyUrl;
    if (!value) return;
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        copied = true;
      } catch {
        copied = legacyCopy(value);
      }
    } else {
      copied = legacyCopy(value);
    }
    toast(copied ? `Copied ${value}` : 'Could not copy automatically. Select the path and copy it manually.');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy-url]');
    if (!button) return;
    event.preventDefault();
    copyPath(button);
  });

  /* ------------------------------------------------------------------
     Confirmation prompts
     ------------------------------------------------------------------ */

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const message = form.dataset.confirm;
    if (!message) return;
    if (!window.confirm(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  /* ------------------------------------------------------------------
     Media uploads
     ------------------------------------------------------------------ */

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function describeFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return '';
    const total = list.reduce((sum, file) => sum + file.size, 0);
    const oversized = list.filter((file) => file.size > uploadLimit);
    const lines = list.map((file) => `${file.name} · ${formatSize(file.size)}`);
    let summary = `${list.length} image${list.length === 1 ? '' : 's'} selected · ${formatSize(total)}\n${lines.join('\n')}`;
    if (list.length > uploadCountLimit) {
      summary += `\n\nOnly ${uploadCountLimit} images can be uploaded at once. Please choose fewer.`;
    }
    if (oversized.length) {
      summary += `\n\nToo large (8MB maximum): ${oversized.map((file) => file.name).join(', ')}`;
    }
    return summary;
  }

  const uploadForm = document.querySelector('[data-upload-form]');
  const uploadInput = document.querySelector('[data-upload-input]');
  const uploadSelection = document.querySelector('[data-upload-selection]');

  if (uploadInput && uploadSelection) {
    const showSelection = () => {
      const summary = describeFiles(uploadInput.files);
      uploadSelection.textContent = summary;
      uploadSelection.hidden = !summary;
    };

    uploadInput.addEventListener('change', showSelection);

    const dropZone = uploadInput.closest('.upload-drop');
    if (dropZone) {
      ['dragenter', 'dragover'].forEach((type) => {
        dropZone.addEventListener(type, (event) => {
          event.preventDefault();
          dropZone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach((type) => {
        dropZone.addEventListener(type, (event) => {
          event.preventDefault();
          dropZone.classList.remove('is-dragover');
        });
      });

      dropZone.addEventListener('drop', (event) => {
        if (!event.dataTransfer?.files?.length) return;
        try {
          uploadInput.files = event.dataTransfer.files;
          showSelection();
        } catch {
          toast('Drag and drop is not available in this browser. Use “Choose images” instead.');
        }
      });
    }

    uploadForm?.addEventListener('submit', (event) => {
      const files = Array.from(uploadInput.files || []);
      if (!files.length) {
        event.preventDefault();
        toast('Choose at least one image before uploading.');
        return;
      }
      if (files.length > uploadCountLimit) {
        event.preventDefault();
        toast(`Please upload no more than ${uploadCountLimit} images at a time.`);
        return;
      }
      if (files.some((file) => file.size > uploadLimit)) {
        event.preventDefault();
        toast('One of those images is larger than 8MB. Please resize it first.');
      }
    });
  }
})();
