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

// Thumbnail TikTok lewat oEmbed (jika gagal, tetap pakai tampilan warna + judul)
document.querySelectorAll('[data-tt]').forEach(function (a) {
  var box = a.querySelector('.thumb') || a.querySelector('.screen'); if (!box) return;
  fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(a.href))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.thumbnail_url) setPoster(box, d.thumbnail_url); })
    .catch(function () {});
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
