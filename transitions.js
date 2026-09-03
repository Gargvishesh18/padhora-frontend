// Shared page-transition fade for Padhora's static multi-page site.
// Fades the outgoing page out before a same-site .html navigation, and
// fades each page in on load, so clicks between pages don't feel like a
// hard instant jump-cut. Respects prefers-reduced-motion.
(function () {
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal() {
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('pt-loading');
    });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    reveal();
  } else {
    document.addEventListener('DOMContentLoaded', reveal);
  }

  if (prefersReduced) return;

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;
    if (a.hasAttribute('download')) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;
    var url;
    try { url = new URL(href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;

    e.preventDefault();
    document.documentElement.classList.add('pt-loading');
    setTimeout(function () { window.location.href = url.href; }, 160);
  });
})();
