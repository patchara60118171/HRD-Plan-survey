/**
 * a11y.js — Accessibility polyfills for the Well-being Survey project.
 * Audit ref: H4 (keyboard navigation) + H5 (aria-label coverage).
 *
 * Minimal, dependency-free helpers:
 *   1. Promote any element that carries an inline `onclick` (but is neither a
 *      native button/link nor already has a role) to `role="button"` +
 *      `tabindex="0"`, and forward Enter/Space keydown to click(). This
 *      rescues all the legacy `<div class="nav-item" onclick="...">` and
 *      `<div class="tab" onclick="...">` patterns in admin.html/ch1.html/
 *      index.html without having to rewrite each markup site.
 *
 *   2. Backfill `aria-label` on icon-only buttons (e.g. "✕", "🔔", "📤 ...")
 *      using the button's own `title` attribute as a fallback label so
 *      screen-reader users hear something meaningful.
 *
 *   3. Inject a single `:focus-visible` ring style so keyboard users can
 *      actually see which control is focused. Guarded by a class on <html>
 *      to avoid colliding with any page-specific focus styling.
 *
 * The script is idempotent and uses a MutationObserver so that dynamically
 * rendered rows/cards (e.g. tables produced via innerHTML) get upgraded too.
 */
(function () {
  'use strict';

  if (typeof document === 'undefined') return;
  if (window.__a11yHelperBooted) return;
  window.__a11yHelperBooted = true;

  var NATIVE_INTERACTIVE = /^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY)$/;

  function upgradeClickable(el) {
    if (!el || el.nodeType !== 1) return;
    if (NATIVE_INTERACTIVE.test(el.tagName)) return;
    if (!el.hasAttribute || !el.hasAttribute('onclick')) return;
    if (el.dataset.a11yUpgraded === '1') return;

    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    el.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        if (event.target !== el) return;
        event.preventDefault();
        el.click();
      }
    });

    el.dataset.a11yUpgraded = '1';
  }

  function isIconOnly(text) {
    if (!text) return true;
    var trimmed = text.replace(/\s+/g, '');
    if (!trimmed) return true;
    // Heuristic: single visible glyph (possibly an emoji pair) with no word chars.
    return !/[A-Za-z\u0E00-\u0E7F0-9]/.test(trimmed) && trimmed.length <= 4;
  }

  function backfillAriaLabel(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.tagName !== 'BUTTON') return;
    if (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) return;
    if (el.dataset.a11yLabelled === '1') return;

    var text = (el.textContent || '').trim();
    if (!isIconOnly(text)) return;

    var label = el.getAttribute('title')
      || el.getAttribute('data-label')
      || (text && text.length ? text : 'ปุ่มเมนู');
    el.setAttribute('aria-label', label);
    el.dataset.a11yLabelled = '1';
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var clickables = scope.querySelectorAll('[onclick]');
    for (var i = 0; i < clickables.length; i++) upgradeClickable(clickables[i]);
    var buttons = scope.querySelectorAll('button');
    for (var j = 0; j < buttons.length; j++) backfillAriaLabel(buttons[j]);
  }

  function injectFocusRing() {
    if (document.getElementById('a11y-focus-ring-style')) return;
    var style = document.createElement('style');
    style.id = 'a11y-focus-ring-style';
    style.textContent = ''
      + '[data-a11y-upgraded="1"]:focus-visible,'
      + '.nav-item:focus-visible,'
      + '.tab:focus-visible,'
      + '.anwb-tab:focus-visible,'
      + 'button:focus-visible,'
      + '[role="button"]:focus-visible,'
      + 'input:focus-visible,'
      + 'select:focus-visible,'
      + 'textarea:focus-visible,'
      + 'a:focus-visible {'
      + '  outline: 2px solid #2563eb;'
      + '  outline-offset: 2px;'
      + '  border-radius: 6px;'
      + '}'
      + '.skip-link {'
      + '  position: absolute;'
      + '  top: -40px;'
      + '  left: 6px;'
      + '  background: #0F4C81;'
      + '  color: white;'
      + '  padding: 8px 16px;'
      + '  text-decoration: none;'
      + '  border-radius: 4px;'
      + '  font-weight: 600;'
      + '  font-size: 14px;'
      + '  z-index: 10000;'
      + '  transition: top 0.2s;'
      + '}'
      + '.skip-link:focus {'
      + '  top: 6px;'
      + '  outline: 2px solid #fff;'
      + '  outline-offset: 2px;'
      + '}';
    (document.head || document.documentElement).appendChild(style);
  }

  function injectSkipLinks() {
    if (document.getElementById('a11y-skip-links')) return;
    
    var main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    var nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    
    var skipLinks = document.createElement('div');
    skipLinks.id = 'a11y-skip-links';
    skipLinks.innerHTML = '';
    
    if (main) {
      skipLinks.innerHTML += '<a href="#main-content" class="skip-link">ข้ามไปเนื้อหาหลัก</a>';
      main.id = 'main-content';
    }
    
    if (nav) {
      skipLinks.innerHTML += '<a href="#main-navigation" class="skip-link">ข้ามไปเมนูนำทาง</a>';
      nav.id = 'main-navigation';
    }
    
    if (skipLinks.innerHTML) {
      document.body.insertBefore(skipLinks, document.body.firstChild);
    }
  }

  function boot() {
    injectFocusRing();
    injectSkipLinks();
    scan(document);

    if (typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function (mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var mutation = mutations[m];
          if (mutation.type === 'attributes' && mutation.target) {
            if (mutation.attributeName === 'onclick') upgradeClickable(mutation.target);
            continue;
          }
          if (mutation.type !== 'childList') continue;
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            var node = mutation.addedNodes[i];
            if (node.nodeType === 1) scan(node);
          }
        }
      });
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['onclick'],
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
