/* =========================================================
   Nagini's Hunt – a snake game written from scratch.
   Nagini slithers around hunting Scabbers the rat.
   Each catch makes her longer (and a little bit faster).

   Handy numbers to tweak are at the top of the file!
   ========================================================= */
(function () {
  'use strict';

  /* ---------- settings you can change ---------- */
  var COLS = 20, ROWS = 20, CELL = 24;   // board size
  var START_DELAY = 150;                 // milliseconds per step at the start (bigger = slower)
  var FASTEST_DELAY = 75;                // she never goes faster than this
  var SPEED_UP = 3;                      // each catch makes her this much quicker
  var FOODS = ['🐀', '🐀', '🐀', '🐁'];  // what Nagini chases
  var BEST_KEY = 'eric-hp-snake-best';

  /* ---------- page elements ---------- */
  var panel = document.getElementById('game-snake');
  var canvas = document.getElementById('snakeCanvas');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('snakeScore');
  var bestEl = document.getElementById('snakeBest');
  var wallsBox = document.getElementById('snakeWalls');
  var startBtn = document.getElementById('snakeStart');

  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  var DIRS = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };

  /* ---------- game state ---------- */
  var snake, dir, queue, food, score, best, state, timer, delay, tongue, deathMsg, newBest;
  // state is one of: 'ready', 'playing', 'paused', 'over'

  best = loadBest();
  bestEl.textContent = best;

  function loadBest() {
    try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function saveBest(n) {
    try { localStorage.setItem(BEST_KEY, String(n)); } catch (e) { /* storage not available – that's fine */ }
  }

  function reset() {
    clearTimeout(timer);
    var cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
    snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }]; // head first
    dir = DIRS.right;
    queue = [];
    score = 0;
    delay = START_DELAY;
    tongue = false;
    deathMsg = '';
    newBest = false;
    state = 'ready';
    do { placeFood(); } while (food && food.y >= ROWS - 3); // keep the first rat clear of the message strip
    scoreEl.textContent = 0;
    updateButton();
    draw();
  }

  function placeFood() {
    var free = [];
    for (var x = 0; x < COLS; x++) {
      for (var y = 0; y < ROWS; y++) {
        if (!onSnake(x, y)) free.push({ x: x, y: y });
      }
    }
    if (!free.length) { food = null; return; } // the whole board is full – amazing!
    var spot = free[Math.floor(Math.random() * free.length)];
    food = { x: spot.x, y: spot.y, emoji: FOODS[Math.floor(Math.random() * FOODS.length)] };
  }

  function onSnake(x, y) {
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
  }

  /* ---------- starting, pausing, steering ---------- */
  function start() {
    if (state === 'over') reset();
    if (state === 'ready' || state === 'paused') {
      state = 'playing';
      updateButton();
      loop();
    }
  }
  function pause() {
    if (state === 'playing') {
      state = 'paused';
      clearTimeout(timer);
      updateButton();
      draw();
    }
  }
  function togglePause() {
    if (state === 'playing') pause(); else start();
  }

  function steer(name) {
    var want = DIRS[name];
    if (state === 'over') return;
    // Before the first move, turning "backwards" just flips Nagini around.
    if (state === 'ready' && want.x === -dir.x && want.y === -dir.y) {
      snake.reverse();
      var a = snake[0], b = snake[1];
      dir = { x: a.x - b.x, y: a.y - b.y };
    }
    var last = queue.length ? queue[queue.length - 1] : dir;
    var opposite = want.x === -last.x && want.y === -last.y;
    var same = want.x === last.x && want.y === last.y;
    if (!opposite && !same && queue.length < 2) queue.push(want);
    if (state === 'ready' || state === 'paused') start();
  }

  /* ---------- one step of the game ---------- */
  function loop() {
    if (state !== 'playing') return;
    step();
    draw();
    if (state === 'playing') timer = setTimeout(loop, delay);
  }

  function step() {
    if (queue.length) dir = queue.shift();
    tongue = !tongue;

    var head = snake[0];
    var nx = head.x + dir.x, ny = head.y + dir.y;

    if (wallsBox.checked) {
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return gameOver('Nagini bumped into the wall!');
    } else {
      nx = (nx + COLS) % COLS; // walls wrap around – go out one side, come in the other
      ny = (ny + ROWS) % ROWS;
    }

    var eating = food && nx === food.x && ny === food.y;
    // The tail moves out of the way, unless she is growing this step.
    var body = eating ? snake : snake.slice(0, -1);
    for (var i = 0; i < body.length; i++) {
      if (body[i].x === nx && body[i].y === ny) return gameOver('Nagini tied herself in a knot!');
    }

    snake.unshift({ x: nx, y: ny });
    if (eating) {
      score++;
      scoreEl.textContent = score;
      delay = Math.max(FASTEST_DELAY, delay - SPEED_UP);
      placeFood();
    } else {
      snake.pop();
    }
  }

  function gameOver(msg) {
    state = 'over';
    deathMsg = msg;
    clearTimeout(timer);
    if (score > best) {
      best = score;
      newBest = true;
      bestEl.textContent = best;
      saveBest(best);
    }
    updateButton();
  }

  function updateButton() {
    startBtn.textContent =
      state === 'ready' ? 'Start' :
      state === 'playing' ? 'Pause' :
      state === 'paused' ? 'Resume' : 'Play again';
  }

  /* ---------- drawing ---------- */
  function draw() {
    // checkerboard floor
    for (var x = 0; x < COLS; x++) {
      for (var y = 0; y < ROWS; y++) {
        ctx.fillStyle = (x + y) % 2 ? '#11301c' : '#0d2616';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Scabbers
    if (food) {
      ctx.font = Math.floor(CELL * 0.85) + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(food.emoji, food.x * CELL + CELL / 2, food.y * CELL + CELL / 2 + 1);
    }

    // Nagini: draw from the tail up to the head so the head ends up on top
    for (var i = snake.length - 1; i >= 0; i--) {
      var seg = snake[i];
      var px = seg.x * CELL, py = seg.y * CELL;
      var isHead = i === 0;
      var shrink = isHead ? 1 : (i === snake.length - 1 ? 4 : 2); // slim tail tip
      ctx.fillStyle = i % 2 ? '#2f9a55' : '#25803f';
      roundRect(px + shrink, py + shrink, CELL - shrink * 2, CELL - shrink * 2, isHead ? 8 : 6);
      ctx.fill();
      if (!isHead) { // a little diamond pattern on her back
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.beginPath();
        ctx.moveTo(px + CELL / 2, py + 6);
        ctx.lineTo(px + CELL - 7, py + CELL / 2);
        ctx.lineTo(px + CELL / 2, py + CELL - 6);
        ctx.lineTo(px + 7, py + CELL / 2);
        ctx.closePath();
        ctx.fill();
      }
    }
    drawHead(snake[0]);

    // messages on top of the board
    if (state === 'ready') banner('Ready?', 'Press an arrow key or tap Start');
    else if (state === 'paused') banner('Paused', 'Press Space to carry on');
    else if (state === 'over') {
      banner(deathMsg, 'Caught ' + score + (score === 1 ? ' rat' : ' rats') +
        (newBest ? ' – a new best! 🎉' : '') + '  •  Enter to play again', true);
    }
  }

  function drawHead(h) {
    var cx = h.x * CELL + CELL / 2, cy = h.y * CELL + CELL / 2;
    var fx = dir.x, fy = dir.y;     // forward
    var sx = -dir.y, sy = dir.x;    // sideways

    // flicking forked tongue
    if (tongue && state !== 'over') {
      var tx = cx + fx * CELL * 0.5, ty = cy + fy * CELL * 0.5;
      var ex = cx + fx * CELL * 0.95, ey = cy + fy * CELL * 0.95;
      ctx.strokeStyle = '#e0242e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(ex, ey);
      ctx.moveTo(ex, ey); ctx.lineTo(ex + fx * 4 + sx * 4, ey + fy * 4 + sy * 4);
      ctx.moveTo(ex, ey); ctx.lineTo(ex + fx * 4 - sx * 4, ey + fy * 4 - sy * 4);
      ctx.stroke();
    }

    // two yellow eyes with slitty pupils
    for (var side = -1; side <= 1; side += 2) {
      var ex2 = cx + fx * CELL * 0.18 + sx * side * CELL * 0.24;
      var ey2 = cy + fy * CELL * 0.18 + sy * side * CELL * 0.24;
      ctx.fillStyle = '#ffe14d';
      ctx.beginPath(); ctx.arc(ex2, ey2, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(ex2, ey2, 1.1, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // A message strip. Big in the middle for "game over", a slim one at the
  // bottom otherwise (so you can still see Nagini and the rat).
  function banner(title, sub, big) {
    var h = big ? 104 : 60;
    var top = big ? canvas.height / 2 - h / 2 : canvas.height - h;
    var mid = top + h / 2;
    ctx.fillStyle = 'rgba(5, 12, 8, .78)';
    ctx.fillRect(0, top, canvas.width, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8c26a';
    ctx.font = '700 ' + (big ? 26 : 20) + 'px Cinzel, Georgia, serif';
    ctx.fillText(title, canvas.width / 2, mid - (big ? 14 : 11), canvas.width - 20);
    ctx.fillStyle = '#f3e5c0';
    ctx.font = '500 17px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(sub, canvas.width / 2, mid + (big ? 22 : 14), canvas.width - 20);
  }

  // A rounded rectangle (done by hand so it works in every browser)
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- controls ---------- */
  var KEYS = {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
    arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'
  };

  window.addEventListener('keydown', function (e) {
    if (panel.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (KEYS[k]) {
      e.preventDefault();               // stop the page scrolling
      steer(KEYS[k]);
    } else if (k === ' ' || k === 'p') {
      e.preventDefault();
      if (state !== 'over') togglePause();
    } else if (k === 'enter' || k === 'r') {
      if (e.target && e.target.tagName === 'BUTTON') return; // let a focused button do its own thing
      e.preventDefault();
      if (state === 'over') { reset(); start(); } else if (state !== 'playing') start();
    }
  });

  // On-screen arrow buttons (phones and tablets)
  document.querySelectorAll('.dpad [data-dir]').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); steer(b.dataset.dir); });
  });

  // Swipe on the board, or tap it to start / resume / play again
  var down = null;
  canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', function (e) {
    if (!down) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y;
    down = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
      steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    } else if (state === 'over') { reset(); start(); }
    else if (state !== 'playing') start();
  });

  startBtn.addEventListener('click', function () {
    if (state === 'over') { reset(); start(); }
    else togglePause();
    startBtn.blur();
    canvas.focus({ preventScroll: true });
  });
  wallsBox.addEventListener('change', function () { reset(); wallsBox.blur(); });

  // Pause automatically if the player leaves the game or the tab
  window.addEventListener('room:leave', function () { if (state === 'playing') pause(); });
  window.addEventListener('room:show', function (e) { if (e.detail === 'snake') draw(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });

  reset();
})();
