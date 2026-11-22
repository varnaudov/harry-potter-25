/* =========================================================
   The Secret Room – menu + stars
   Shows the game menu, and switches between the games.
   Games tell each other when to stop using two events:
     'room:show'  (detail = game name)   'room:leave'
   ========================================================= */
(function () {
  'use strict';

  // Warm candle-coloured stars (the CSS recolours them)
  var starBox = document.getElementById('stars');
  for (var i = 0; i < 60; i++) {
    var s = document.createElement('span');
    var size = 1 + Math.random() * 2.5;
    s.className = 'star';
    s.style.cssText =
      'left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      '--d:' + (2 + Math.random() * 4) + 's;--delay:' + (Math.random() * 4) + 's;';
    starBox.appendChild(s);
  }

  var menu = document.getElementById('menu');
  var games = {
    snake: document.getElementById('game-snake'),
    snitch: document.getElementById('game-snitch')
  };

  function show(name) {
    window.dispatchEvent(new CustomEvent('room:leave'));
    menu.hidden = !!name;
    document.body.classList.toggle('in-game', !!name); // hides the big title so the game fits on screen
    Object.keys(games).forEach(function (k) { games[k].hidden = (k !== name); });
    if (name) window.dispatchEvent(new CustomEvent('room:show', { detail: name }));
  }

  document.querySelectorAll('[data-game]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.game); });
  });
  document.querySelectorAll('[data-action="menu"]').forEach(function (b) {
    b.addEventListener('click', function () { show(null); });
  });
})();
