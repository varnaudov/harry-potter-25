/* =========================================================
   Catch the Golden Snitch – a quick reaction game.
   The Snitch zooms around. Click or tap it as many times
   as you can before the 30 seconds run out!
   ========================================================= */
(function () {
  'use strict';

  var GAME_SECONDS = 30;
  var BEST_KEY = 'eric-hp-snitch-best';

  var field = document.getElementById('snitchField');
  var snitch = document.getElementById('snitch');
  var msg = document.getElementById('snitchMsg');
  var scoreEl = document.getElementById('snitchScore');
  var timeEl = document.getElementById('snitchTime');
  var bestEl = document.getElementById('snitchBest');
  var startBtn = document.getElementById('snitchStart');

  var score = 0, timeLeft = GAME_SECONDS, playing = false;
  var clock = null, mover = null;
  var best = loadBest();
  bestEl.textContent = best;

  function loadBest() {
    try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function saveBest(n) {
    try { localStorage.setItem(BEST_KEY, String(n)); } catch (e) { /* fine */ }
  }

  // Jump to a random spot inside the field. It gets quicker as your score grows.
  function moveSnitch() {
    var maxX = field.clientWidth - snitch.offsetWidth;
    var maxY = field.clientHeight - snitch.offsetHeight;
    var x = Math.random() * Math.max(0, maxX);
    var y = Math.random() * Math.max(0, maxY);
    var travel = Math.max(0.3, 0.8 - score * 0.03); // seconds to fly across
    snitch.style.setProperty('--t', travel + 's');
    snitch.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function scheduleMove() {
    clearTimeout(mover);
    var every = Math.max(450, 1000 - score * 30);
    mover = setTimeout(function () {
      if (!playing) return;
      moveSnitch();
      scheduleMove();
    }, every);
  }

  function startGame() {
    score = 0;
    timeLeft = GAME_SECONDS;
    playing = true;
    scoreEl.textContent = 0;
    timeEl.textContent = timeLeft;
    msg.textContent = '';
    startBtn.textContent = 'Restart';
    snitch.hidden = false;
    snitch.style.setProperty('--t', '0s');
    snitch.style.transform = 'translate(' + (field.clientWidth / 2 - 45) + 'px,' + (field.clientHeight / 2 - 27) + 'px)';
    clearInterval(clock);
    clock = setInterval(function () {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
    setTimeout(function () { if (playing) { moveSnitch(); scheduleMove(); } }, 400);
  }

  function stopTimers() {
    playing = false;
    clearInterval(clock);
    clearTimeout(mover);
  }

  function endGame() {
    stopTimers();
    snitch.hidden = true;
    var line = score < 5 ? 'Keep practising, Seeker!' :
               score < 10 ? 'Nice flying!' :
               score < 15 ? 'Wow, you could be on the team!' : 'Legendary Seeker! 🏆';
    var record = '';
    if (score > best) { best = score; bestEl.textContent = best; saveBest(best); record = ' New best! 🎉'; }
    msg.textContent = 'Time\'s up! You caught ' + score + '. ' + line + record;
    startBtn.textContent = 'Play again';
  }

  snitch.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!playing) return;
    score++;
    scoreEl.textContent = score;
    scoreEl.classList.remove('pop');
    void scoreEl.offsetWidth;          // restart the little "pop" animation
    scoreEl.classList.add('pop');
    moveSnitch();                       // it zooms off straight away
    scheduleMove();
  });

  startBtn.addEventListener('click', function () { startGame(); startBtn.blur(); });

  // Leaving the game (back to the menu) cancels the round
  window.addEventListener('room:leave', function () {
    if (playing) {
      stopTimers();
      snitch.hidden = true;
      msg.textContent = 'Press Start, then click or tap the Snitch!';
      startBtn.textContent = 'Start';
    }
  });
})();
