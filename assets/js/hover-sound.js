/**
 * Hover Sound Effect
 * Generates a subtle "tick" sound using the Web Audio API
 * when hovering over interactive elements (nav links, buttons, cards).
 * No external audio files needed — pure synthesis.
 */
(function () {
  'use strict';

  var audioCtx = null;
  var isUnlocked = false;

  /**
   * Lazily create (or reuse) an AudioContext.
   */
  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /**
   * Unlock AudioContext on first user gesture (required by Safari / Chrome).
   * mousedown, click, touchstart, keydown are all valid user gestures.
   */
  function unlockAudio() {
    if (isUnlocked) return;
    var ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().then(function () {
        isUnlocked = true;
      });
    } else {
      isUnlocked = true;
    }
    // Also play a silent buffer to fully unlock on iOS Safari
    var buffer = ctx.createBuffer(1, 1, 22050);
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  }

  /**
   * Play a subtle "tick" sound.
   * Frequency ~1800 Hz, duration ~60ms, moderate volume.
   */
  function playTick() {
    if (!isUnlocked) return;
    try {
      var ctx = getCtx();
      if (ctx.state !== 'running') return;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 1800;

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      // Silently fail if audio is not supported
    }
  }

  /**
   * Throttle: prevent rapid-fire sounds when mouse moves fast across many items.
   */
  var lastPlay = 0;
  var THROTTLE_MS = 80;

  function throttledTick() {
    var now = Date.now();
    if (now - lastPlay < THROTTLE_MS) return;
    lastPlay = now;
    playTick();
  }

  /**
   * Attach hover listeners using event delegation on the document body.
   */
  function init() {
    // Unlock audio on first user gesture (click, mousedown, touchstart, keydown)
    ['click', 'mousedown', 'touchstart', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, unlockAudio, { once: true });
    });

    // Selector for interactive elements that should produce the tick
    var SELECTOR = [
      '.nav-links a',
      '.mobile-menu-links a',
      '.service-card',
      '.news-item',
      '.latest-news-item',
      '.view-more-link a',
      '.portfolio-card',
      '.back-to-top',
      '.footer-social a',
      '.profile-hero-social a',
      '.profile-skill-tags span',
      '.profile-back-link a',
      'button',
      '.btn'
    ].join(',');

    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest(SELECTOR);
      if (target) {
        throttledTick();
      }
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
