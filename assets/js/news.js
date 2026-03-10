/**
 * Centralized News Renderer (i18n-aware)
 * Fetches news from assets/data/news.json and renders into:
 *   1. Latest News ticker (Swiper vertical slider)
 *   2. Update Information list
 * Only the N most recent items are shown (default: 3).
 *
 * The JSON is keyed by language ("en", "es"). On language change
 * the news is re-rendered automatically via __i18n hooks.
 */
(function () {
  'use strict';

  var NEWS_JSON_PATH = 'assets/data/news.json';
  var DEFAULT_VISIBLE = 3;

  /** Cached data from the JSON fetch (keyed by lang). */
  var newsData = null;

  /* ---- helpers ---- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  /** Return the active language code, falling back to 'en'. */
  function getLang() {
    return (window.__i18n && window.__i18n.getLang) ? window.__i18n.getLang() : 'en';
  }

  /** Get the "View More" label from i18n or fallback. */
  function viewMoreLabel() {
    return (window.__i18n && window.__i18n.t) ? window.__i18n.t('update.viewmore') : 'View More \u203A';
  }

  /* ---- DOM builders ---- */

  function buildTickerSlide(item) {
    var slide = el('div', 'swiper-slide');
    var link = el('a', 'latest-news-item');
    link.href = item.link;

    var days = el('span', 'latest-news-days');
    days.appendChild(el('span', 'latest-news-date', item.date));
    days.appendChild(el('span', 'latest-news-member', item.member));
    days.appendChild(el('span', 'latest-news-tag', item.tag));

    var text = el('span', 'latest-news-text', item.text);
    text.setAttribute('data-swiper-parallax', '-400');

    link.appendChild(days);
    link.appendChild(text);
    slide.appendChild(link);
    return slide;
  }

  function buildUpdateItem(item) {
    var link = el('a', 'news-item');
    link.href = item.link;

    var meta = el('div', 'news-meta');
    meta.appendChild(el('span', 'news-date', item.date));
    meta.appendChild(el('span', 'news-member', item.member));
    meta.appendChild(el('span', 'news-tag', item.tag));

    var text = el('span', 'news-text', item.text);
    var arrow = el('span', 'news-arrow');
    arrow.textContent = '\u203A';

    link.appendChild(meta);
    link.appendChild(text);
    link.appendChild(arrow);
    return link;
  }

  /* ---- render ---- */

  function renderNews(items) {
    var visible = items.slice(0, DEFAULT_VISIBLE);

    // 1. Latest News ticker
    var swiperWrapper = document.querySelector('.newsTickerSwiper .swiper-wrapper');
    if (swiperWrapper) {
      while (swiperWrapper.firstChild) swiperWrapper.removeChild(swiperWrapper.firstChild);
      for (var i = 0; i < visible.length; i++) {
        swiperWrapper.appendChild(buildTickerSlide(visible[i]));
      }
    }

    // 2. Update Information list
    var updateList = document.querySelector('.update-list');
    if (updateList) {
      while (updateList.firstChild) updateList.removeChild(updateList.firstChild);
      for (var j = 0; j < visible.length; j++) {
        updateList.appendChild(buildUpdateItem(visible[j]));
      }
      var vmWrap = el('div', 'view-more-link');
      var vmLink = el('a', '', viewMoreLabel());
      vmLink.href = 'news.html';
      vmWrap.appendChild(vmLink);
      updateList.appendChild(vmWrap);
    }

    // 3. (Re-)initialize ticker Swiper
    initTickerSwiper();
  }

  function initTickerSwiper() {
    var swiperEl = document.querySelector('.newsTickerSwiper');
    if (!swiperEl) return;
    if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
    new Swiper('.newsTickerSwiper', {
      loop: true,
      slidesPerView: 1,
      autoplay: { delay: 4000, disableOnInteraction: false },
      parallax: true,
      speed: 800,
      direction: 'vertical',
      allowTouchMove: true
    });
  }

  /* ---- language-aware render ---- */

  /** Pick the right array from cached data and render. */
  function renderForCurrentLang() {
    if (!newsData) return;
    var lang = getLang();
    var items = newsData[lang] || newsData['en'] || [];
    if (items.length) renderNews(items);
  }

  /* ---- listen for i18n language changes ---- */

  /**
   * Listen for the 'langchange' custom event dispatched by i18n.js.
   * This avoids race conditions from script loading order — works
   * regardless of whether i18n.js loads before or after news.js.
   */
  function listenI18n() {
    document.addEventListener('langchange', function () {
      renderForCurrentLang();
    });
  }

  /* ---- init ---- */

  function init() {
    fetch(NEWS_JSON_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('News fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        newsData = data;
        renderForCurrentLang();
      })
      .catch(function (err) {
        // silently handle news data load errors
      });
  }

  // Register the language-change listener immediately (no timing dependency)
  listenI18n();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
