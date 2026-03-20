(function() {
  var total = document.querySelectorAll('.skill-easter').length;
  var snakeLaunched = false;

  function checkAllActive() {
    if (snakeLaunched) return;
    var active = document.querySelectorAll('.skill-easter.active').length;
    if (active >= total) {
      snakeLaunched = true;
      setTimeout(launchSnake, 600);
    }
  }

  document.querySelectorAll('.skill-easter').forEach(function(el) {
    var img = document.createElement('img');
    img.src = el.getAttribute('data-icon');
    img.alt = '';
    img.className = 'skill-icon';
    el.insertBefore(img, el.firstChild);
    var rect = el.getBoundingClientRect();
    el.style.minWidth = rect.width + 'px';
    el.style.minHeight = rect.height + 'px';
    var timer = null;
    var locked = false;
    el.addEventListener('mouseenter', function() {
      if (locked) return;
      timer = setTimeout(function() {
        el.classList.add('active'); locked = true; checkAllActive();
      }, 3000);
    });
    el.addEventListener('mouseleave', function() { clearTimeout(timer); });
    el.addEventListener('click', function() {
      if (locked) return;
      clearTimeout(timer);
      el.classList.add('active'); locked = true; checkAllActive();
    });
  });

  function launchSnake() {
    var section = document.querySelector('#section-skills').parentElement;
    var grid = section.querySelector('.profile-skills-grid');

    // Fade out grid
    grid.style.transition = 'opacity 0.5s ease';
    grid.style.opacity = '0';

    // Measure grid before hiding
    var gridRect = grid.getBoundingClientRect();
    var gridW = grid.offsetWidth;
    var gridH = grid.offsetHeight;

    setTimeout(function() {
      grid.style.display = 'none';

      // Build game container with DOM methods
      var wrap = document.createElement('div');
      wrap.className = 'snake-game-wrap';
      wrap.style.textAlign = 'center';
      wrap.style.padding = '0';

      // Header
      var hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:12px;';

      var title = document.createElement('span');
      title.style.cssText = 'font-family:monospace;font-size:20px;font-weight:700;color:#d4a017;letter-spacing:2px;';
      title.textContent = '\uD83D\uDC0D SNAKE';

      var scoreLbl = document.createElement('span');
      scoreLbl.style.cssText = 'font-family:monospace;font-size:15px;color:#999;';
      scoreLbl.textContent = 'Score: ';
      var scoreVal = document.createElement('strong');
      scoreVal.id = 'snake-score';
      scoreVal.textContent = '0';
      scoreLbl.appendChild(scoreVal);

      var closeBtn = document.createElement('button');
      closeBtn.style.cssText = 'background:none;border:1px solid #444;color:#999;font-size:16px;width:28px;height:28px;border-radius:4px;cursor:pointer;line-height:1;';
      closeBtn.title = 'Close';
      closeBtn.textContent = '\u2715';

      hdr.appendChild(title);
      hdr.appendChild(scoreLbl);
      hdr.appendChild(closeBtn);
      wrap.appendChild(hdr);

      // Canvas — match skills grid dimensions
      var canvas = document.createElement('canvas');
      canvas.id = 'snake-canvas';
      var hdrH = 36;
      var hintH = 24;
      var cw = gridW;
      var ch = Math.max(200, gridH - hdrH - hintH);
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.cssText = 'border:2px solid #d4a017;border-radius:6px;background:#0a0a0a;display:block;margin:0 auto;width:100%;touch-action:none;';
      wrap.appendChild(canvas);

      // Hint
      var hint = document.createElement('p');
      hint.style.cssText = 'font-size:12px;color:#777;margin-top:8px;font-family:monospace;';
      hint.textContent = 'Use arrow keys or swipe to play. Eat the golden dots!';
      wrap.appendChild(hint);

      section.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      var gs = 20;
      var tcX = Math.floor(cw / gs);
      var tcY = Math.floor(ch / gs);
      var snake = [{x: Math.floor(tcX/2), y: Math.floor(tcY/2)}];
      var dir = {x:1, y:0};
      var nextDir = {x:1, y:0};
      var food = placeFood();
      var score = 0;
      var gameOver = false;
      var gameLoop = null;
      var speed = 120;

      function placeFood() {
        var f;
        do {
          f = {x: Math.floor(Math.random()*tcX), y: Math.floor(Math.random()*tcY)};
        } while (snake.some(function(s){ return s.x===f.x && s.y===f.y; }));
        return f;
      }

      function draw() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, cw, ch);

        // Grid lines
        ctx.strokeStyle = 'rgba(212,160,23,0.06)';
        ctx.lineWidth = 0.5;
        for (var i = 0; i <= tcX; i++) {
          ctx.beginPath(); ctx.moveTo(i*gs,0); ctx.lineTo(i*gs,ch); ctx.stroke();
        }
        for (var j = 0; j <= tcY; j++) {
          ctx.beginPath(); ctx.moveTo(0,j*gs); ctx.lineTo(cw,j*gs); ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#d4a017';
        ctx.shadowColor = '#d4a017';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(food.x*gs+gs/2, food.y*gs+gs/2, gs/2-2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach(function(seg, i) {
          var alpha = 1 - (i / snake.length) * 0.5;
          ctx.fillStyle = i === 0 ? '#d4a017' : 'rgba(212,160,23,' + alpha + ')';
          ctx.fillRect(seg.x*gs+1, seg.y*gs+1, gs-2, gs-2);
          if (i === 0) {
            // Eyes
            ctx.fillStyle = '#0a0a0a';
            var ex1, ey1, ex2, ey2, er = 2;
            if (dir.x === 1) { ex1=seg.x*gs+gs*0.65; ey1=seg.y*gs+gs*0.3; ex2=ex1; ey2=seg.y*gs+gs*0.7; }
            else if (dir.x === -1) { ex1=seg.x*gs+gs*0.35; ey1=seg.y*gs+gs*0.3; ex2=ex1; ey2=seg.y*gs+gs*0.7; }
            else if (dir.y === 1) { ex1=seg.x*gs+gs*0.3; ey1=seg.y*gs+gs*0.65; ex2=seg.x*gs+gs*0.7; ey2=ey1; }
            else { ex1=seg.x*gs+gs*0.3; ey1=seg.y*gs+gs*0.35; ex2=seg.x*gs+gs*0.7; ey2=ey1; }
            ctx.beginPath(); ctx.arc(ex1,ey1,er,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ex2,ey2,er,0,Math.PI*2); ctx.fill();
          }
        });

        if (gameOver) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, 0, cw, ch);
          ctx.fillStyle = '#d4a017';
          ctx.font = 'bold 28px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER', cw/2, ch/2-10);
          ctx.fillStyle = '#999';
          ctx.font = '14px monospace';
          ctx.fillText('Score: ' + score, cw/2, ch/2+20);
          ctx.fillText('Click to restart', cw/2, ch/2+44);
        }
      }

      function update() {
        if (gameOver) return;
        dir = nextDir;
        var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

        if (head.x < 0 || head.x >= tcX || head.y < 0 || head.y >= tcY) { gameOver = true; draw(); return; }
        if (snake.some(function(s){ return s.x===head.x && s.y===head.y; })) { gameOver = true; draw(); return; }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          scoreVal.textContent = score;
          food = placeFood();
          if (speed > 60) speed -= 3;
          clearInterval(gameLoop);
          gameLoop = setInterval(function(){ update(); draw(); }, speed);
        } else {
          snake.pop();
        }
      }

      function handleKey(e) {
        var k = e.key;
        if (k === 'ArrowUp' && dir.y !== 1) nextDir = {x:0,y:-1};
        else if (k === 'ArrowDown' && dir.y !== -1) nextDir = {x:0,y:1};
        else if (k === 'ArrowLeft' && dir.x !== 1) nextDir = {x:-1,y:0};
        else if (k === 'ArrowRight' && dir.x !== -1) nextDir = {x:1,y:0};
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(k) > -1) e.preventDefault();
      }

      // Touch support
      var touchStart = null;
      canvas.addEventListener('touchstart', function(e) {
        touchStart = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      });
      canvas.addEventListener('touchmove', function(e) { e.preventDefault(); }, {passive:false});
      canvas.addEventListener('touchend', function(e) {
        if (!touchStart) return;
        var dx = e.changedTouches[0].clientX - touchStart.x;
        var dy = e.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 20 && dir.x !== -1) nextDir = {x:1,y:0};
          else if (dx < -20 && dir.x !== 1) nextDir = {x:-1,y:0};
        } else {
          if (dy > 20 && dir.y !== -1) nextDir = {x:0,y:1};
          else if (dy < -20 && dir.y !== 1) nextDir = {x:0,y:-1};
        }
        touchStart = null;
      });

      // Restart on click
      canvas.addEventListener('click', function() {
        if (!gameOver) return;
        snake = [{x: Math.floor(tcX/2), y: Math.floor(tcY/2)}];
        dir = {x:1,y:0}; nextDir = {x:1,y:0};
        food = placeFood(); score = 0; speed = 120; gameOver = false;
        scoreVal.textContent = '0';
        clearInterval(gameLoop);
        gameLoop = setInterval(function(){ update(); draw(); }, speed);
      });

      // Close — restore skills
      closeBtn.addEventListener('click', function() {
        clearInterval(gameLoop);
        document.removeEventListener('keydown', handleKey);
        section.removeChild(wrap);
        grid.style.display = '';
        grid.style.opacity = '1';
        snakeLaunched = false;
        document.querySelectorAll('.skill-easter').forEach(function(el) {
          el.classList.remove('active');
        });
      });

      document.addEventListener('keydown', handleKey);
      gameLoop = setInterval(function(){ update(); draw(); }, speed);
      draw();
      canvas.scrollIntoView({behavior:'smooth', block:'center'});
    }, 500);
  }
})();
