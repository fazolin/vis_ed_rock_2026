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
  const isAsset   = img.closest('.loop-asset') !== null;
  const loopDesc  = loopItem?.querySelector('.loop-desc');
  const musicaNome = musica?.querySelector('.musica-nome');

  const tagColor  = loopTag ? getComputedStyle(loopTag).color : '#777';

  // overlay
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';

  // container
  const container = document.createElement('div');
  container.className = 'lb-container';

  // imagem
  const clone = document.createElement('img');
  clone.src = img.src;
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
  downloadBtn.href = img.src;
  downloadBtn.download = img.src.split('/').pop();
  downloadBtn.textContent = '↓ baixar';
  downloadBtn.addEventListener('click', e => e.stopPropagation());

  container.appendChild(clone);
  container.appendChild(info);
  container.appendChild(downloadBtn);
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
  });
});
