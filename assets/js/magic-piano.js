(function() {
  'use strict';

  // ===== MAGIC PIANO EASTER EGG =====
  // Triggered by:
  //   1. Playing the Interstellar melody correctly on Publications links
  //   2. Triple-clicking the "O" in "Book" / "Libro"

  var pianoActive = false;

  // --- Interstellar melody detection ---
  // The famous ascending melody: A4-B4-C5-E5 | D5-C5-B4-A4
  var interstellarSeq = [440, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440];
  var playedNotes = [];
  var melodyTimeout = null;

  function trackNote(freq) {
    playedNotes.push(freq);
    if (playedNotes.length > interstellarSeq.length) {
      playedNotes = playedNotes.slice(-interstellarSeq.length);
    }
    clearTimeout(melodyTimeout);
    melodyTimeout = setTimeout(function() { playedNotes = []; }, 8000);

    if (playedNotes.length === interstellarSeq.length) {
      var match = true;
      for (var i = 0; i < interstellarSeq.length; i++) {
        if (playedNotes[i] !== interstellarSeq[i]) { match = false; break; }
      }
      if (match && !pianoActive) {
        playedNotes = [];
        showPiano();
      }
    }
  }

  // Intercept pub-piano hover events
  var section = document.querySelector('#section-publications');
  if (section) {
    var pubSection = section.parentElement;
    var links = pubSection.querySelectorAll('.profile-pub-detail a, .profile-pub-orcid a');
    var noteFreqs = [440, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440];
    links.forEach(function(link, i) {
      link.addEventListener('mouseenter', function() {
        trackNote(noteFreqs[i % noteFreqs.length]);
      });
    });
  }

  // --- Triple-click on "O" in Book/Libro ---
  var bookH3 = document.getElementById('book-heading');
  if (bookH3) {
    var clickCount = 0;
    var clickTimer = null;

    function wrapLetterO() {
      var text = bookH3.textContent;
      var idx = text.indexOf('o');
      if (idx === -1) idx = text.indexOf('O');
      if (idx === -1) return;
      var before = text.substring(0, idx);
      var letter = text.charAt(idx);
      var after = text.substring(idx + 1);
      var span = document.createElement('span');
      span.className = 'piano-o-trigger';
      span.style.cursor = 'text';
      span.textContent = letter;
      bookH3.textContent = '';
      bookH3.appendChild(document.createTextNode(before));
      bookH3.appendChild(span);
      bookH3.appendChild(document.createTextNode(after));
    }
    wrapLetterO();

    var obs = new MutationObserver(function(mutations) {
      obs.disconnect();
      wrapLetterO();
      obs.observe(bookH3, { childList: true, characterData: true, subtree: true });
    });
    obs.observe(bookH3, { childList: true, characterData: true, subtree: true });

    bookH3.addEventListener('click', function(e) {
      var target = e.target;
      if (!target.classList || !target.classList.contains('piano-o-trigger')) return;
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function() { clickCount = 0; }, 600);
      if (clickCount >= 3 && !pianoActive) {
        clickCount = 0;
        showPiano();
      }
    });
  }

  // ===== PIANO CONFIG =====
  var pianoKeys = [
    { note: 'C4',  freq: 261.63, key: 'a', black: false },
    { note: 'C#4', freq: 277.18, key: 'w', black: true },
    { note: 'D4',  freq: 293.66, key: 's', black: false },
    { note: 'D#4', freq: 311.13, key: 'e', black: true },
    { note: 'E4',  freq: 329.63, key: 'd', black: false },
    { note: 'F4',  freq: 349.23, key: 'f', black: false },
    { note: 'F#4', freq: 369.99, key: 't', black: true },
    { note: 'G4',  freq: 392.00, key: 'g', black: false },
    { note: 'G#4', freq: 415.30, key: 'y', black: true },
    { note: 'A4',  freq: 440.00, key: 'h', black: false },
    { note: 'A#4', freq: 466.16, key: 'u', black: true },
    { note: 'B4',  freq: 493.88, key: 'j', black: false },
    { note: 'C5',  freq: 523.25, key: 'k', black: false },
    { note: 'C#5', freq: 554.37, key: 'o', black: true },
    { note: 'D5',  freq: 587.33, key: 'l', black: false },
    { note: 'D#5', freq: 622.25, key: 'p', black: true },
    { note: 'E5',  freq: 659.25, key: ';', black: false },
    { note: 'F5',  freq: 698.46, key: "'", black: false },
    { note: 'F#5', freq: 739.99, key: ']', black: true },
    { note: 'G5',  freq: 783.99, key: '\\', black: false }
  ];

  var audioCtx = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playPianoNote(freq) {
    var ctx = getCtx();
    var now = ctx.currentTime;
    var dur = 1.8;

    var osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;

    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.002;

    var osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2;

    var g1 = ctx.createGain();
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.2, now + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, now + dur);

    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.08, now + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);

    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0, now);
    g3.gain.linearRampToValueAtTime(0.03, now + 0.01);
    g3.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.5);

    var delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.15;
    var dGain = ctx.createGain();
    dGain.gain.value = 0.08;

    var master = ctx.createGain();
    master.gain.value = 0.8;

    osc1.connect(g1); g1.connect(master);
    osc2.connect(g2); g2.connect(master);
    osc3.connect(g3); g3.connect(master);
    g1.connect(delay); delay.connect(dGain); dGain.connect(master);
    master.connect(ctx.destination);

    var stop = now + dur + 0.5;
    osc1.start(now); osc1.stop(stop);
    osc2.start(now); osc2.stop(stop);
    osc3.start(now); osc3.stop(stop);
  }

  // ===== PIANO UI =====
  function showPiano() {
    if (pianoActive) return;
    pianoActive = true;

    // Build overlay
    var overlay = document.createElement('div');
    overlay.className = 'magic-piano-overlay';

    var container = document.createElement('div');
    container.className = 'magic-piano-container';

    // Header
    var header = document.createElement('div');
    header.className = 'magic-piano-header';
    var title = document.createElement('span');
    title.className = 'magic-piano-title';
    title.textContent = 'Interstellar Piano';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'magic-piano-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00D7';
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Hint
    var hint = document.createElement('div');
    hint.className = 'magic-piano-hint';
    hint.textContent = 'Use your keyboard to play';

    // Sheet music scroll — Cornfield Chase melody
    var sheetScroll = document.createElement('div');
    sheetScroll.className = 'mp-sheet-scroll';

    var sheetTitle = document.createElement('div');
    sheetTitle.className = 'mp-sheet-title';
    sheetTitle.textContent = 'Interstellar — Main Theme';

    var sheetComposer = document.createElement('div');
    sheetComposer.className = 'mp-sheet-composer';
    sheetComposer.textContent = 'Hans Zimmer';

    var sheetStaff = document.createElement('div');
    sheetStaff.className = 'mp-sheet-staff';

    // The famous viral melody — the emotional ascending part everyone plays
    // First the gentle ostinato intro, then the climactic melody
    var sheetNotes = [
      // Intro ostinato (gentle)
      { note: 'A4', key: 'H', beat: 1 },
      { note: 'E4', key: 'D', beat: 1 },
      { note: 'A4', key: 'H', beat: 1 },
      { note: 'E4', key: 'D', beat: 1 },
      { note: '',   key: '',  beat: 0 },  // bar
      // Famous ascending melody (the one that makes everyone cry)
      { note: 'A4', key: 'H', beat: 1 },
      { note: 'B4', key: 'J', beat: 1 },
      { note: 'C5', key: 'K', beat: 1 },
      { note: 'E5', key: ';', beat: 2 },
      { note: '',   key: '',  beat: 0 },  // bar
      // Descending resolution
      { note: 'D5', key: 'L', beat: 1 },
      { note: 'C5', key: 'K', beat: 1 },
      { note: 'B4', key: 'J', beat: 1 },
      { note: 'A4', key: 'H', beat: 1 },
      { note: '',   key: '',  beat: 0 },  // bar
      // Second ascending phrase (higher intensity)
      { note: 'A4', key: 'H', beat: 1 },
      { note: 'B4', key: 'J', beat: 1 },
      { note: 'C5', key: 'K', beat: 1 },
      { note: 'D5', key: 'L', beat: 2 },
      { note: '',   key: '',  beat: 0 },  // bar
      // Final resolution
      { note: 'C5', key: 'K', beat: 1 },
      { note: 'B4', key: 'J', beat: 1 },
      { note: 'A4', key: 'H', beat: 2 }
    ];

    // Build staff lines (5 lines)
    var staffLines = document.createElement('div');
    staffLines.className = 'mp-staff-lines';
    for (var sl = 0; sl < 5; sl++) {
      var line = document.createElement('div');
      line.className = 'mp-staff-line';
      staffLines.appendChild(line);
    }
    sheetStaff.appendChild(staffLines);

    // Build notes on staff
    var notesRow = document.createElement('div');
    notesRow.className = 'mp-notes-row';

    // Note position mapping (staff position from bottom, in half-steps from E4 bottom line)
    var notePositions = {
      'A3': 0, 'B3': 1, 'C4': 2, 'D4': 3, 'E4': 4, 'F4': 5, 'G4': 6,
      'A4': 7, 'B4': 8, 'C5': 9, 'D5': 10, 'E5': 11
    };

    sheetNotes.forEach(function(n, idx) {
      if (n.beat === 0) {
        // Bar line
        var bar = document.createElement('div');
        bar.className = 'mp-bar-line';
        notesRow.appendChild(bar);
        return;
      }

      var noteEl = document.createElement('div');
      noteEl.className = 'mp-sheet-note';
      noteEl.setAttribute('data-idx', idx);

      var pos = notePositions[n.note] || 0;
      // Position: bottom line (E4) = 4, each step = 6px
      noteEl.style.setProperty('--note-pos', pos);

      // Note head (filled circle)
      var head = document.createElement('div');
      head.className = 'mp-note-head';

      // Ledger line for notes below staff (A3, B3)
      if (pos < 2) {
        var ledger = document.createElement('div');
        ledger.className = 'mp-ledger-line';
        noteEl.appendChild(ledger);
      }
      // Ledger line for C5 and above
      if (pos >= 9) {
        var ledgerH = document.createElement('div');
        ledgerH.className = 'mp-ledger-line mp-ledger-high';
        noteEl.appendChild(ledgerH);
      }

      // Stem
      var stem = document.createElement('div');
      stem.className = pos >= 5 ? 'mp-note-stem mp-stem-down' : 'mp-note-stem';

      // Key badge below
      var keyBadge = document.createElement('div');
      keyBadge.className = 'mp-note-key';
      keyBadge.textContent = n.key;

      noteEl.appendChild(head);
      noteEl.appendChild(stem);
      noteEl.appendChild(keyBadge);
      notesRow.appendChild(noteEl);
    });

    sheetStaff.appendChild(notesRow);
    sheetScroll.appendChild(sheetTitle);
    sheetScroll.appendChild(sheetComposer);
    sheetScroll.appendChild(sheetStaff);

    // Keys container
    var keysContainer = document.createElement('div');
    keysContainer.className = 'magic-piano-keys';

    container.appendChild(header);
    container.appendChild(hint);
    container.appendChild(sheetScroll);
    container.appendChild(keysContainer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    requestAnimationFrame(function() {
      overlay.classList.add('visible');
    });

    // Build keys
    pianoKeys.forEach(function(k) {
      var el = document.createElement('div');
      el.className = k.black ? 'mp-key mp-black' : 'mp-key mp-white';
      el.setAttribute('data-freq', k.freq);
      el.setAttribute('data-key', k.key);

      var label = document.createElement('span');
      label.className = 'mp-key-label';
      label.textContent = k.key.toUpperCase();
      el.appendChild(label);

      var noteName = document.createElement('span');
      noteName.className = 'mp-key-note';
      noteName.textContent = k.note;
      el.appendChild(noteName);

      el.addEventListener('mousedown', function(e) {
        e.preventDefault();
        pressKey(k, el);
      });
      el.addEventListener('mouseup', function() { releaseKey(el); });
      el.addEventListener('mouseleave', function() { releaseKey(el); });
      el.addEventListener('touchstart', function(e) {
        e.preventDefault();
        pressKey(k, el);
      }, { passive: false });
      el.addEventListener('touchend', function() { releaseKey(el); });

      keysContainer.appendChild(el);
    });

    // Keyboard handler
    var keyMap = {};
    pianoKeys.forEach(function(k) { keyMap[k.key] = k; });

    function onKeyDown(e) {
      if (!pianoActive) return;
      if (e.key === 'Escape') { closePiano(); return; }
      var k = keyMap[e.key.toLowerCase()];
      if (k) {
        e.preventDefault();
        var el = keysContainer.querySelector('[data-key="' + k.key + '"]');
        if (el && !el.classList.contains('active')) {
          pressKey(k, el);
        }
      }
    }

    function onKeyUp(e) {
      if (!pianoActive) return;
      var k = keyMap[e.key.toLowerCase()];
      if (k) {
        var el = keysContainer.querySelector('[data-key="' + k.key + '"]');
        if (el) releaseKey(el);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    function pressKey(k, el) {
      el.classList.add('active');
      playPianoNote(k.freq);
    }

    function releaseKey(el) {
      el.classList.remove('active');
    }

    function closePiano() {
      overlay.classList.remove('visible');
      setTimeout(function() {
        overlay.remove();
        pianoActive = false;
      }, 400);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    }

    closeBtn.addEventListener('click', closePiano);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closePiano();
    });
  }

})();
