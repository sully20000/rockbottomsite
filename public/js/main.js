(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.getElementById('mobile-nav');
  const dialog = document.getElementById('start-helper-dialog');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header state */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Mobile navigation */
  const closeNav = () => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    header?.classList.remove('nav-open');
    mobileNav.hidden = true;
  };

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
        return;
      }
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      header?.classList.add('nav-open');
      mobileNav.hidden = false;
      mobileNav.querySelector('a')?.focus({ preventScroll: true });
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (event) => {
      if (mobileNav.hidden) return;
      if (header?.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* “I don't know where to start” dialog */
  if (dialog && typeof dialog.showModal === 'function') {
    const openers = document.querySelectorAll('[data-open-helper]');

    const openDialog = (event) => {
      event.preventDefault();
      closeNav();
      dialog.showModal();
      document.body.classList.add('dialog-open');
    };

    openers.forEach((opener) => {
      opener.addEventListener('click', openDialog);
    });

    dialog.querySelectorAll('[data-close-dialog]').forEach((link) => {
      link.addEventListener('click', () => {
        dialog.close();
      });
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }

  /* Helpful feedback */
  const helpfulForm = document.querySelector('[data-helpful-form]');
  if (helpfulForm && typeof window.fetch === 'function') {
    const button = helpfulForm.querySelector('[data-helpful-button]');
    const buttonLabel = helpfulForm.querySelector('[data-helpful-button-label]');
    const countElement = helpfulForm.querySelector('[data-helpful-count]');
    const countLabel = helpfulForm.querySelector('[data-helpful-count-label]');
    const errorElement = helpfulForm.querySelector('[data-helpful-error]');
    const csrfInput = helpfulForm.querySelector('input[name="_csrf"]');

    helpfulForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!button || button.disabled) return;
      button.disabled = true;
      if (errorElement) errorElement.hidden = true;

      try {
        const response = await fetch(helpfulForm.action, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ _csrf: csrfInput ? csrfInput.value : '' }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error('Not counted');

        if (countElement) {
          countElement.textContent = new Intl.NumberFormat('en-GB').format(data.count);
        }
        if (countLabel) {
          countLabel.textContent =
            data.count === 1 ? countLabel.dataset.one : countLabel.dataset.many;
        }
        if (buttonLabel) {
          buttonLabel.textContent = helpfulForm.dataset.votedLabel || 'Counted — thank you';
        }
      } catch {
        button.disabled = false;
        if (errorElement) errorElement.hidden = false;
      }
    });
  }

  /* Reveal on scroll */
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  /* Close mobile nav with Escape */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav && !mobileNav.hidden) {
      closeNav();
      navToggle?.focus();
    }
  });
})();
