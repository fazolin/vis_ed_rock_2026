/* ── UNLOCK PROMPTS ── */
const PROMPT_PASSWORD = 'ada2026';

function unlockPrompts() {
  const btn = document.getElementById('unlockBtn');
  if (!document.body.classList.contains('prompts-locked')) {
    document.body.classList.add('prompts-locked');
    btn.textContent = '⌒ prompts';
    btn.classList.remove('unlocked');
    return;
  }
  const input = prompt('Senha para ver os prompts:');
  if (input === null) return;
  if (input === PROMPT_PASSWORD) {
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
