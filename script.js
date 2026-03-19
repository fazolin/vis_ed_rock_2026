/* ── UNLOCK PROMPTS ── */
const PROMPT_PASSWORD_HASH = '1be6481a38121a28bdb2708fd92317cd699f0e2c803be5df16609489098753f2';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function unlockPrompts() {
  const btn = document.getElementById('unlockBtn');
  if (!document.body.classList.contains('prompts-locked')) {
    document.body.classList.add('prompts-locked');
    btn.textContent = '⌒ prompts';
    btn.classList.remove('unlocked');
    return;
  }
  const input = prompt('Senha para ver os prompts:');
  if (input === null) return;
  const hash = await sha256(input);
  if (hash === PROMPT_PASSWORD_HASH) {
    document.body.classList.remove('prompts-locked');
    btn.textContent = '✓ prompts';
    btn.classList.add('unlocked');
  } else {
    alert('Senha incorreta.');
  }
}

/* ── COPY PROMPT ── */
function copyP(btn) {
  const box = btn.closest('.prompt-box');
  const promptSpan = box.querySelector('.prompt-text');
  const text = promptSpan ? promptSpan.textContent.trim() : '';
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'copiado ✓';
    btn.style.color = '#c9a84c';
    btn.style.borderColor = '#c9a84c';
    setTimeout(() => {
      btn.textContent = 'copiar';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2200);
  });
}

/* ── LIGHTBOX ── */
function openLightbox(img) {
  const loopItem  = img.closest('.loop-item');
  const musica    = img.closest('.musica');

  const loopTag   = loopItem?.querySelector('.loop-tag');
  const loopName  = loopItem?.querySelector('.loop-name');
  const loopDesc  = loopItem?.querySelector('.loop-desc');
  const musicaNome = musica?.querySelector('.musica-nome');

  const isAsset   = img.closest('.loop-asset') !== null;
  const tagColor  = loopTag ? getComputedStyle(loopTag).color : '#777';

  // carousel slides
  let slides = [img.src];
  if (img.dataset.slides) {
    try { slides = JSON.parse(img.dataset.slides); } catch(e) {}
  }
  let currentIndex = 0;

  // overlay
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';

  // container
  const container = document.createElement('div');
  container.className = 'lb-container';

  // imagem
  const clone = document.createElement('img');
  clone.src = slides[currentIndex];
  clone.className = 'lb-img';
  clone.alt = img.alt;

  // info overlay sobre a imagem
  const info = document.createElement('div');
  info.className = 'lb-info';
  info.innerHTML = `
    <div class="lb-info-music" style="color:${tagColor}">
      ${musicaNome ? musicaNome.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim() : ''}
    </div>
    <div class="lb-info-loop">
      <span class="lb-info-loop-num" style="color:${tagColor}">${loopTag ? loopTag.textContent.trim() : ''}</span>
      <span class="lb-info-loop-name">${loopName ? loopName.textContent.trim() : ''}</span>
    </div>
    <div class="lb-info-desc">${isAsset ? 'asset' : (loopDesc ? loopDesc.textContent.trim() : '')}</div>
  `;

  // botão download
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'lb-download';
  downloadBtn.href = slides[currentIndex];
  downloadBtn.download = slides[currentIndex].split('/').pop();
  downloadBtn.textContent = '↓ baixar';
  downloadBtn.addEventListener('click', e => e.stopPropagation());

  container.appendChild(clone);
  container.appendChild(info);
  container.appendChild(downloadBtn);

  // carrossel (só se tiver mais de 1 slide)
  if (slides.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lb-prev';
    prevBtn.textContent = '<';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lb-next';
    nextBtn.textContent = '>';

    const counter = document.createElement('div');
    counter.className = 'lb-counter';
    counter.textContent = `1 / ${slides.length}`;

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      clone.src = slides[currentIndex];
      downloadBtn.href = slides[currentIndex];
      downloadBtn.download = slides[currentIndex].split('/').pop();
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }

    prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(currentIndex - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(currentIndex + 1); });

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(counter);
  }

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('lb-active'));
  });

  function close() {
    overlay.classList.remove('lb-active');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft'  && slides.length > 1) goTo(currentIndex - 1);
    if (e.key === 'ArrowRight' && slides.length > 1) goTo(currentIndex + 1);
  }

  overlay.addEventListener('click', close);
  container.addEventListener('click', e => e.stopPropagation());
  clone.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
}

/* ── ASSET ── */
function openAsset(btn) {
  const img = btn.closest('.loop-item').querySelector('.loop-asset img');
  if (img) openLightbox(img);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Local: desbloqueia prompts automaticamente
  const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    document.body.classList.remove('prompts-locked');
    const btn = document.getElementById('unlockBtn');
    if (btn) { btn.textContent = '✓ prompts'; btn.classList.add('unlocked'); }
  }

  document.querySelectorAll('.loop-preview img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
    if (img.dataset.slides) {
      try {
        const count = JSON.parse(img.dataset.slides).length;
        if (count > 1) {
          img.closest('.loop-preview').classList.add('has-carousel');
          img.closest('.loop-preview').dataset.count = count;
        }
      } catch(e) {}
    }
  });
});

// ── MULTI-VIDEO ──
var currentVideos = [];
var currentVidIdx = 0;

function openCurrentVideo(el) {
  currentVideos = JSON.parse(el.dataset.videos);
  currentVidIdx = 0;
  updateModalNav();
  openVideoModal(currentVideos[0]);
}

function vidNavVideo(dir) {
  currentVidIdx = (currentVidIdx + dir + currentVideos.length) % currentVideos.length;
  updateModalNav();
  openVideoModal(currentVideos[currentVidIdx]);
}

function updateModalNav() {
  var multi = currentVideos.length > 1;
  var prev = document.getElementById('vid-prev');
  var next = document.getElementById('vid-next');
  var counter = document.getElementById('vid-counter');
  prev.style.display = multi ? 'flex' : 'none';
  next.style.display = multi ? 'flex' : 'none';
  if (multi) {
    counter.textContent = (currentVidIdx + 1) + ' / ' + currentVideos.length;
    counter.style.display = 'block';
  } else {
    counter.style.display = 'none';
  }
}

// ── VIDEO MODAL ──
var vidEl = null;

function openVideoModal(src) {
  vidEl = document.getElementById('modal-video');
  var modal = document.getElementById('video-modal');
  vidEl.src = src;
  modal.classList.add('active');
  vidEl.play();
  var dl = document.getElementById('vid-download');
  if (dl) { dl.href = src; dl.download = src.split('/').pop(); }
  document.getElementById('vid-play').textContent = '⏸';

  vidEl.addEventListener('timeupdate', vidUpdate);
  vidEl.addEventListener('ended', function() {
    document.getElementById('vid-play').textContent = '▶';
  });
}

function closeVideoModal() {
  var modal = document.getElementById('video-modal');
  if (!modal.classList.contains('active')) return;
  modal.classList.remove('active');
  vidEl.pause();
  vidEl.removeEventListener('timeupdate', vidUpdate);
  vidEl.src = '';
  currentVideos = [];
  currentVidIdx = 0;
  document.getElementById('vid-prev').style.display = 'none';
  document.getElementById('vid-next').style.display = 'none';
  document.getElementById('vid-counter').style.display = 'none';
  document.getElementById('vid-play').textContent = '▶';
  document.getElementById('vid-seek').value = 0;
  document.getElementById('vid-time').textContent = '0:00';
}

function vidToggle() {
  if (!vidEl) return;
  if (vidEl.paused) {
    vidEl.play();
    document.getElementById('vid-play').textContent = '⏸';
  } else {
    vidEl.pause();
    document.getElementById('vid-play').textContent = '▶';
  }
}

function vidSeek(val) {
  if (vidEl && vidEl.duration) vidEl.currentTime = val * vidEl.duration / 100;
}

function vidUpdate() {
  if (!vidEl || !vidEl.duration) return;
  var pct = (vidEl.currentTime / vidEl.duration) * 100;
  document.getElementById('vid-seek').value = pct;
  var m = Math.floor(vidEl.currentTime / 60);
  var s = Math.floor(vidEl.currentTime % 60).toString().padStart(2,'0');
  document.getElementById('vid-time').textContent = m + ':' + s;
}

function vidFullscreen() {
  if (vidEl) {
    if (vidEl.webkitRequestFullscreen) vidEl.webkitRequestFullscreen();
    else if (vidEl.requestFullscreen) vidEl.requestFullscreen();
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeVideoModal();
});
