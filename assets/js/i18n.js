/**
 * i18n — Lightweight internationalisation engine
 *
 * How it works:
 *   1. Loads translations from assets/data/i18n.json (two keys: "en", "es").
 *   2. Any element with [data-i18n="key"] gets its textContent replaced.
 *   3. Elements with [data-i18n-html="key"] have their content rebuilt using
 *      safe DOM methods (supports <br> line breaks only — no raw innerHTML).
 *   4. The active language is persisted in localStorage("lang").
 *   5. ESP / ENG buttons (class .nav-language-option) toggle the language.
 *   6. <html lang=""> is updated to match.
 *   7. The news.js dynamic content labels are updated when language changes.
 */
(function () {
  'use strict';

  var I18N_PATH = 'assets/data/i18n.json';
  var STORAGE_KEY = 'lang';
  var DEFAULT_LANG = 'en';

  var translations = null;
  var currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  /* ---- helpers ---- */

  function langCode(lang) {
    if (lang === 'es' || lang === 'ESP' || lang === 'esp') return 'es';
    return 'en';
  }

  /**
   * Safely set element content that may contain <br> tags.
   * Splits on <br>, <br/>, <br /> and creates text + br nodes via DOM API.
   * No raw innerHTML — immune to XSS.
   */
  function setSafeHTML(el, text) {
    while (el.firstChild) el.removeChild(el.firstChild);
    var parts = text.split(/<br\s*\/?>/i);
    for (var i = 0; i < parts.length; i++) {
      if (i > 0) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(parts[i]));
    }
  }

  /* ---- apply translations ---- */

  function applyTranslations(lang) {
    if (!translations || !translations[lang]) return;
    var t = translations[lang];

    // textContent replacements
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (t[key] !== undefined) {
        nodes[i].textContent = t[key];
      }
    }

    // Safe HTML replacements (for keys that contain <br>)
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var hKey = htmlNodes[j].getAttribute('data-i18n-html');
      if (t[hKey] !== undefined) {
        setSafeHTML(htmlNodes[j], t[hKey]);
      }
    }

    // Rich HTML replacements (supports <strong>, <em>, etc.)
    var richNodes = document.querySelectorAll('[data-i18n-rich]');
    for (var r = 0; r < richNodes.length; r++) {
      var rKey = richNodes[r].getAttribute('data-i18n-rich');
      if (t[rKey] !== undefined) {
        richNodes[r].innerHTML = t[rKey];
      }
    }

    // Update <html lang="">
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';

    // Update active state on language buttons
    var buttons = document.querySelectorAll('.nav-language-option');
    for (var k = 0; k < buttons.length; k++) {
      var btn = buttons[k];
      var btnText = btn.textContent.trim().toUpperCase();
      if ((lang === 'es' && btnText === 'ESP') || (lang === 'en' && btnText === 'ENG')) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    }

    // Re-render the "View More" text in update-list (injected by news.js)
    var vmLinks = document.querySelectorAll('.view-more-link a');
    for (var m = 0; m < vmLinks.length; m++) {
      vmLinks[m].textContent = t['update.viewmore'] || 'View More \u203A';
    }
  }

  /* ---- switch language ---- */

  function setLang(lang) {
    lang = langCode(lang);
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
    // Notify other scripts (e.g. news.js) about the language change
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  /* ---- expose for external use ---- */
  window.__i18n = {
    getLang: function () { return currentLang; },
    setLang: setLang,
    t: function (key) {
      if (!translations || !translations[currentLang]) return key;
      return translations[currentLang][key] || key;
    }
  };

  /* ---- init ---- */

  function bindButtons() {
    var buttons = document.querySelectorAll('.nav-language-option');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var label = this.textContent.trim().toUpperCase();
        setLang(label === 'ESP' ? 'es' : 'en');
      });
    }
  }

  function init() {
    fetch(I18N_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('i18n fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        translations = data;
        applyTranslations(currentLang);
        bindButtons();
      })
      .catch(function (err) {
        // silently handle i18n load errors
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
