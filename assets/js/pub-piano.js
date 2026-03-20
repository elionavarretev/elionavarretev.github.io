(function() {
  // Interstellar — Main Theme by Hans Zimmer
  // The famous ascending melody: A4-B4-C5-E5 | D5-C5-B4-A4
  var notes = [
    { freq: 440.00 },  // A4  — Book
    { freq: 493.88 },  // B4  — ISCMI
    { freq: 523.25 },  // C5  — ICALTER 2025
    { freq: 659.25 },  // E5  — Anxiety
    { freq: 587.33 },  // D5  — Cognitive AI
    { freq: 523.25 },  // C5  — Eat4U
    { freq: 493.88 },  // B4  — Vik's Adventures
    { freq: 440.00 }   // A4  — ORCID
  ];

  var audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Unlock on first gesture
  ['click', 'mousedown', 'touchstart'].forEach(function(evt) {
    document.addEventListener(evt, function() { getAudioCtx(); }, { once: true });
  });

  function playNote(freq) {
    var ctx = getAudioCtx();
    if (ctx.state !== 'running') return;
    var now = ctx.currentTime;

    // --- Organ-like layered synthesis (Zimmer's church organ tone) ---

    // Fundamental — warm sine
    var osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;

    // Slight detune — chorus/organ width
    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.003;

    // Sub-octave — the deep Zimmer rumble
    var oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.value = freq * 0.5;

    // Octave above — organ brightness
    var oscHigh = ctx.createOscillator();
    oscHigh.type = 'sine';
    oscHigh.frequency.value = freq * 2;

    // Fifth harmonic — organ pipe character
    var oscFifth = ctx.createOscillator();
    oscFifth.type = 'sine';
    oscFifth.frequency.value = freq * 1.5;

    // Gain envelopes — slow swell like organ bellows
    var g1 = ctx.createGain();
    g1.gain.setValueAtTime(0, now);
    g1.gain.linearRampToValueAtTime(0.15, now + 0.15);
    g1.gain.setValueAtTime(0.15, now + 0.8);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.07, now + 0.18);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    var gSub = ctx.createGain();
    gSub.gain.setValueAtTime(0, now);
    gSub.gain.linearRampToValueAtTime(0.10, now + 0.2);
    gSub.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    var gHigh = ctx.createGain();
    gHigh.gain.setValueAtTime(0, now);
    gHigh.gain.linearRampToValueAtTime(0.025, now + 0.25);
    gHigh.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    var gFifth = ctx.createGain();
    gFifth.gain.setValueAtTime(0, now);
    gFifth.gain.linearRampToValueAtTime(0.02, now + 0.2);
    gFifth.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    // Delay for cathedral reverb feel
    var delay1 = ctx.createDelay(1.0);
    delay1.delayTime.value = 0.25;
    var dGain1 = ctx.createGain();
    dGain1.gain.value = 0.12;

    var delay2 = ctx.createDelay(1.0);
    delay2.delayTime.value = 0.5;
    var dGain2 = ctx.createGain();
    dGain2.gain.value = 0.06;

    // Master
    var master = ctx.createGain();
    master.gain.value = 0.9;

    // Connect voices
    osc1.connect(g1); g1.connect(master);
    osc2.connect(g2); g2.connect(master);
    oscSub.connect(gSub); gSub.connect(master);
    oscHigh.connect(gHigh); gHigh.connect(master);
    oscFifth.connect(gFifth); gFifth.connect(master);

    // Reverb delays
    g1.connect(delay1); delay1.connect(dGain1); dGain1.connect(master);
    g1.connect(delay2); delay2.connect(dGain2); dGain2.connect(master);

    master.connect(ctx.destination);

    // Play
    var stopTime = now + 4.0;
    osc1.start(now); osc1.stop(stopTime);
    osc2.start(now); osc2.stop(stopTime);
    oscSub.start(now); oscSub.stop(stopTime);
    oscHigh.start(now); oscHigh.stop(stopTime);
    oscFifth.start(now); oscFifth.stop(stopTime);
  }

  // Attach to publication links
  var section = document.querySelector('#section-publications');
  if (!section) return;
  var pubSection = section.parentElement;
  var links = pubSection.querySelectorAll('.profile-pub-detail a, .profile-pub-orcid a');

  links.forEach(function(link, i) {
    var note = notes[i % notes.length];
    link.addEventListener('mouseenter', function() {
      playNote(note.freq);
    });
  });
})();
