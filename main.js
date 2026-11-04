// Filter karya
document.querySelectorAll('.chip').forEach(function (b) {
  b.addEventListener('click', function () {
    var f = b.dataset.f;
    document.querySelectorAll('.chip').forEach(function (c) {
      c.setAttribute('aria-pressed', c === b ? 'true' : 'false');
    });
    document.querySelectorAll('.work').forEach(function (w) {
      w.hidden = !(f === 'all' || w.dataset.cat === f);
    });
  });
});

// Salin email
document.getElementById('copy').addEventListener('click', function () {
  var btn = this, el = document.getElementById('email'), t = el.textContent;
  function done() { btn.textContent = 'Tersalin'; setTimeout(function () { btn.textContent = 'Salin email'; }, 1800); }
  function fallback() {
    var r = document.createRange(); r.selectNodeContents(el);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = 'Tekan Ctrl+C';
  }
  try { navigator.clipboard.writeText(t).then(done, fallback); } catch (e) { fallback(); }
});

// ---------- Video ----------
function ytSrc(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
}
function ttSrc(id, opts) {
  var p = Object.assign({
    autoplay: 1, muted: 0, loop: 1, controls: 1, progress_bar: 1, play_button: 1,
    volume_control: 1, fullscreen_button: 1, timestamp: 1, music_info: 0,
    description: 0, rel: 0, native_context_menu: 0, closed_caption: 0
  }, opts || {});
  return 'https://www.tiktok.com/player/v1/' + id + '?' + new URLSearchParams(p).toString();
}
function makeFrame(src, title) {
  var f = document.createElement('iframe');
  f.src = src;
  f.title = title || 'Video';
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  f.referrerPolicy = 'strict-origin-when-cross-origin';
  return f;
}
function setPoster(box, url) {
  var img = new Image();
  img.className = 'poster';
  img.alt = '';
  img.loading = 'lazy';
  img.onload = function () { box.classList.add('has-img'); };
  img.src = url;
  box.insertBefore(img, box.firstChild);
  return img;
}

// Thumbnail YouTube (maxres, fallback ke hq)
document.querySelectorAll('[data-yt]').forEach(function (a) {
  var box = a.querySelector('.thumb'); if (!box) return;
  var id = a.dataset.yt;
  var img = setPoster(box, 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg');
  img.onerror = function () { img.onerror = null; img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };
  img.addEventListener('load', function () {
    // maxresdefault yang tidak ada mengembalikan gambar abu kecil 120x90
    if (img.naturalWidth <= 120 && img.src.indexOf('maxres') > -1) img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  });
});

// Thumbnail TikTok: frame pertama tiap video, disimpan di folder thumbs/<id>.jpg
// (jika file belum ada, tampilan warna + judul tetap dipakai)
document.querySelectorAll('[data-tt]').forEach(function (a) {
  var box = a.querySelector('.thumb') || a.querySelector('.screen'); if (!box) return;
  setPoster(box, 'thumbs/' + a.dataset.tt + '.jpg');
});

// Klik thumbnail = putar di halaman; klik judul = buka di platform
document.querySelectorAll('[data-yt],[data-tt]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var box = a.querySelector('.thumb') || a.querySelector('.screen');
    if (!box || !box.contains(e.target)) return; // klik di luar video: ikuti link
    e.preventDefault();
    if (box.classList.contains('playing')) return;
    var title = (a.querySelector('h3') || a.querySelector('.t') || {}).textContent;
    var src = a.dataset.yt ? ytSrc(a.dataset.yt) : ttSrc(a.dataset.tt);
    box.classList.add('playing');
    box.appendChild(makeFrame(src, title));
  });
});

// Showcase: putar otomatis (tanpa suara) saat HP terlihat di layar
(function () {
  var phones = document.querySelectorAll('.showcase [data-tt]');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var a = en.target, box = a.querySelector('.screen');
      io.unobserve(a);
      if (box.classList.contains('playing')) return;
      box.classList.add('playing');
      box.appendChild(makeFrame(ttSrc(a.dataset.tt, {
        muted: 1, controls: 0, play_button: 0, fullscreen_button: 0, timestamp: 0, progress_bar: 1
      }), (a.querySelector('.t') || {}).textContent));
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  phones.forEach(function (p) { io.observe(p); });
})();

// ---------- Slider karya ----------
(function () {
  var sc = document.getElementById('works'); if (!sc) return;
  var prev = document.querySelector('.slider .prev'), next = document.querySelector('.slider .next');
  var dotsBox = document.getElementById('dots');
  function cards() { return [].slice.call(sc.querySelectorAll('.work')).filter(function (c) { return !c.hidden; }); }
  function centerOf(el) { return el.offsetLeft + el.offsetWidth / 2 - sc.clientWidth / 2; }
  function current() {
    var mid = sc.scrollLeft + sc.clientWidth / 2, best = 0, bd = Infinity;
    cards().forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function go(i) { var cs = cards(); i = Math.max(0, Math.min(cs.length - 1, i)); sc.scrollTo({ left: centerOf(cs[i]), behavior: 'smooth' }); }
  function buildDots() {
    dotsBox.innerHTML = '';
    cards().forEach(function (_, i) {
      var b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1;
      b.addEventListener('click', function () { go(i); }); dotsBox.appendChild(b);
    });
    pad(); sc.style.scrollBehavior = 'auto'; sc.scrollLeft = 0; sc.style.scrollBehavior = ''; update();
  }
  function pad() {
    var cs = cards(), tr = sc.querySelector('.track'); if (!cs.length) return;
    tr.style.paddingLeft = Math.max(0, (sc.clientWidth - cs[0].offsetWidth) / 2) + 'px';
    tr.style.paddingRight = Math.max(0, (sc.clientWidth - cs[cs.length - 1].offsetWidth) / 2) + 'px';
  }
  function update() {
    var max = sc.scrollWidth - sc.clientWidth;
    var scrollable = max > 2;
    prev.disabled = !scrollable || sc.scrollLeft <= 2;
    next.disabled = !scrollable || sc.scrollLeft >= max - 2;
    dotsBox.hidden = !scrollable;
    var cur = current();
    [].forEach.call(dotsBox.children, function (d, i) { d.classList.toggle('on', i === cur); });
    cards().forEach(function (c, i) { c.classList.toggle('active', i === cur); });
  }
  prev.addEventListener('click', function () { go(current() - 1); });
  next.addEventListener('click', function () { go(current() + 1); });
  sc.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
  });
  var t; sc.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
  window.addEventListener('resize', function () { var c = current(); pad(); var cs = cards(); if (cs[c]) sc.scrollLeft = centerOf(cs[c]); update(); });
  document.querySelectorAll('.chip').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(buildDots, 0); });
  });
  // drag dengan mouse di desktop
  var down = false, sx = 0, sl = 0, moved = false;
  sc.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = sc.scrollLeft; sc.style.scrollSnapType = 'none'; sc.style.scrollBehavior = 'auto'; });
  window.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 5) moved = true; sc.scrollLeft = sl - dx; });
  window.addEventListener('mouseup', function () { if (!down) return; down = false; sc.style.scrollSnapType = ''; sc.style.scrollBehavior = ''; if (moved) go(current()); });
  sc.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  sc.addEventListener('click', function (e) {
    var card = e.target.closest('.work'); if (!card || card.classList.contains('active')) return;
    e.preventDefault(); e.stopPropagation(); go(cards().indexOf(card));
  }, true);
  sc.addEventListener('dragstart', function (e) { e.preventDefault(); });
  buildDots();
  window.addEventListener('load', function () { pad(); sc.style.scrollBehavior = 'auto'; sc.scrollLeft = 0; sc.style.scrollBehavior = ''; update(); });
})();
