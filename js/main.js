/* =========================================================
   Harry Potter fan site – main page scripts
   1. Twinkling stars   2. Wand sparkle trail   3. Scroll reveal
   4. Sorting Hat       5. THE EASTER EGG (Platform 9¾ sign)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- 1. Stars ---------- */
  var starBox = document.getElementById('stars');
  for (var i = 0; i < 90; i++) {
    var s = document.createElement('span');
    var size = 1 + Math.random() * 2.5;
    s.className = 'star';
    s.style.cssText =
      'left:' + Math.random() * 100 + '%;' +
      'top:' + Math.random() * 100 + '%;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      '--d:' + (2 + Math.random() * 4) + 's;' +
      '--delay:' + (Math.random() * 4) + 's;';
    starBox.appendChild(s);
  }

  /* ---------- 2. Wand sparkle trail (mouse only) ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var last = 0;
    window.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - last < 45) return; // don't make too many
      last = now;
      var sp = document.createElement('span');
      sp.className = 'sparkle';
      sp.textContent = Math.random() > 0.5 ? '✦' : '✧';
      sp.style.left = e.clientX + 'px';
      sp.style.top = e.clientY + 'px';
      sp.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
      sp.style.setProperty('--dy', (10 + Math.random() * 30) + 'px');
      document.body.appendChild(sp);
      sp.addEventListener('animationend', function () { sp.remove(); });
    });
  }

  /* ---------- 3. Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 4. Houses + Sorting Hat ---------- */
  var blurbs = {
    Gryffindor: 'Gryffindor: where the brave live! 🦁',
    Hufflepuff: 'Hufflepuff: loyal, kind and fair! 🦡',
    Ravenclaw: 'Ravenclaw: for the wise and the curious! 🦅',
    Slytherin: 'Slytherin: ambitious and cunning! 🐍'
  };
  var houseButtons = document.querySelectorAll('.house');
  var hatMsg = document.getElementById('hatMsg');

  function pick(btn, prefix) {
    houseButtons.forEach(function (b) { b.classList.remove('picked'); });
    btn.classList.add('picked');
    hatMsg.textContent = (prefix || '') + blurbs[btn.dataset.house];
  }
  houseButtons.forEach(function (b) {
    b.addEventListener('click', function () { pick(b); });
  });
  document.getElementById('hatBtn').addEventListener('click', function () {
    hatMsg.textContent = 'Hmmm… difficult… very difficult…';
    var list = Array.prototype.slice.call(houseButtons);
    setTimeout(function () {
      pick(list[Math.floor(Math.random() * list.length)], 'Better be… ');
    }, 1100);
  });

  /* ---------- 5. THE EASTER EGG ----------
     Clicking the Platform 9¾ sign makes the wall shimmer, flashes the
     screen, then opens the secret room (secret.html). */
  var door = document.getElementById('secretDoor');
  var photo = document.getElementById('platformPhoto');
  var whoosh = document.getElementById('whoosh');
  var going = false;

  door.addEventListener('click', function () {
    if (going) return;
    going = true;
    photo.classList.add('go');
    setTimeout(function () { whoosh.classList.add('on'); }, 500);
    setTimeout(function () { window.location.href = 'secret.html'; }, reduceMotion ? 50 : 1150);
  });
})();
