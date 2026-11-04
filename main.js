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
