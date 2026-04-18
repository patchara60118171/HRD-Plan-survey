/*
 * Production console silencer
 * -----------------------------------
 * Audit ref: M2 in docs/AUDIT_REPORT_2026-04.md
 *
 * Silences console.log / console.debug / console.info on production hosts to
 * avoid leaking diagnostic data to end-users (and to trim noise in DevTools).
 * Keeps console.warn / console.error active because they signal real problems.
 *
 * Activation rule:
 *   - localhost, 127.0.0.1, *.local, *.test      → keep verbose logging
 *   - ?debug=1 query flag                         → keep verbose logging
 *   - window.__WB_DEBUG === true (set manually)   → keep verbose logging
 *   - anything else (e.g. nidawellbeing.vercel.app) → silence log/info/debug
 *
 * Include this script FIRST on every page (before other JS) so subsequent
 * scripts see the neutered console from the start.
 */
(function () {
  if (typeof window === 'undefined') return;

  var host = (window.location && window.location.hostname) || '';
  var isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '' ||
    host.endsWith('.local') ||
    host.endsWith('.test');

  var debugFlag =
    /[?&]debug=1\b/.test(window.location.search || '') ||
    window.__WB_DEBUG === true;

  if (isLocal || debugFlag) return; // keep verbose console

  try {
    var noop = function () {};
    // Preserve originals in case something wants them back.
    window.__wbConsoleOriginal = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
    console.log = noop;
    console.info = noop;
    console.debug = noop;
  } catch (_e) {
    // If the browser refuses to reassign (rare), do nothing.
  }
})();
