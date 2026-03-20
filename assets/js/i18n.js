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

  var I18N_PATH = (window.__i18nBase || 'assets/data/') + 'i18n.json';
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

    // Placeholder replacements
    var placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < placeholderNodes.length; p++) {
      var pKey = placeholderNodes[p].getAttribute('data-i18n-placeholder');
      if (t[pKey] !== undefined) {
        placeholderNodes[p].setAttribute('placeholder', t[pKey]);
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
      var isActive = (lang === 'es' && btnText === 'ESP') || (lang === 'en' && btnText === 'ENG');
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
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

  /**
   * Merge extra translations into the main translations object.
   * Each extra file has the same {"en":{…}, "es":{…}} structure.
   */
  function mergeTranslations(extra) {
    if (!extra) return;
    ['en', 'es'].forEach(function (lang) {
      if (extra[lang]) {
        if (!translations[lang]) translations[lang] = {};
        var keys = Object.keys(extra[lang]);
        for (var i = 0; i < keys.length; i++) {
          translations[lang][keys[i]] = extra[lang][keys[i]];
        }
      }
    });
  }

  function init() {
    var basePath = window.__i18nBase || 'assets/data/';
    var extraFiles = window.__i18nExtra || [];

    fetch(I18N_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('i18n fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        translations = data;

        // Load extra translation files (e.g. blog batch files)
        var extraPromises = extraFiles.map(function (file) {
          return fetch(basePath + file)
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; });
        });

        return Promise.all(extraPromises);
      })
      .then(function (extras) {
        for (var i = 0; i < extras.length; i++) {
          if (extras[i]) mergeTranslations(extras[i]);
        }
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
