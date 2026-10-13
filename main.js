(function () {
  'use strict';
  var top = document.querySelector('.top');
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = top.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  // home album: first photo large, next three small, "+N" on the last small one
  function layoutAlbum() {
    if (document.body.classList.contains('editing')) return;
    var tiles = [].slice.call(document.querySelectorAll('.album .atile'));
    var vis = tiles.filter(function (t) { return t.querySelector('.ph.has-img'); });
    vis.forEach(function (t, i) {
      t.classList.remove('a-main', 'a-sm');
      t.removeAttribute('data-more');
      if (i === 0) t.classList.add('a-main'); else if (i <= 3) t.classList.add('a-sm');
    });
    if (vis.length > 4) vis[3].setAttribute('data-more', '+' + (vis.length - 4));
    var box = document.querySelector('.halbum');
    if (box && vis.length) box.classList.remove('empty');
  }

  // photos and figures appear only when the image file exists
  document.querySelectorAll('.ph').forEach(function (fig) {
    var src = fig.getAttribute('data-src');
    if (!src) return;
    var img = new Image();
    img.onload = function () {
      img.alt = fig.getAttribute('data-cap') || '';
      fig.insertBefore(img, fig.firstChild);
      fig.classList.add('has-img');
      layoutAlbum();
    };
    img.src = src;
  });

  // lightbox with previous / next across the clicked photo's group (album, figures, galleries)
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button><button class="lb-p" aria-label="Previous">&#8249;</button>' +
                 '<button class="lb-n" aria-label="Next">&#8250;</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  var list = [], idx = 0;
  function show() {
    var f = list[idx];
    lb.querySelector('img').src = f.querySelector('img').src;
    lb.querySelector('p').textContent = f.getAttribute('data-cap') || '';
    var many = list.length > 1;
    lb.querySelector('.lb-p').style.display = many ? '' : 'none';
    lb.querySelector('.lb-n').style.display = many ? '' : 'none';
  }
  function step(d) { idx = (idx + d + list.length) % list.length; show(); }
  document.addEventListener('click', function (e) {
    var f = e.target.closest('.fig .ph.has-img, .atile .ph.has-img');
    if (!f) return;
    var box = f.closest('[data-list]') || document;
    list = [].slice.call(box.querySelectorAll('.ph.has-img'));
    idx = Math.max(0, list.indexOf(f));
    lb.hidden = false;
    show();
  });
  lb.addEventListener('click', function (e) {
    if (e.target.closest('.lb-p')) { step(-1); return; }
    if (e.target.closest('.lb-n')) { step(1); return; }
    lb.hidden = true;
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lb.hidden = true;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
