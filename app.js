(() => {
  const photos = (Array.isArray(window.WEDDING_PHOTOS) ? window.WEDDING_PHOTOS : []).filter(p => p && typeof p.src === 'string');
  const grid = document.querySelector('#galleryGrid');
  const dialog = document.querySelector('#lightbox');
  const enlarged = document.querySelector('#lightboxImage');
  let index = 0, opener = null;
  const hero = document.querySelector('#heroImage');
  hero.addEventListener('load', () => hero.classList.add('ready'));
  let triedFallback = false;
  hero.addEventListener('error', () => {
    hero.classList.remove('ready');
    if (!triedFallback && photos.length) { triedFallback = true; hero.src = photos[0].src; }
  });
  if (photos.length || window.WEDDING_COVER) hero.src = window.WEDDING_COVER || photos[0].src;
  document.querySelector('#empty').hidden = photos.length > 0;
  function show() {
    const photo = photos[index];
    enlarged.src = photo.src;
    enlarged.alt = photo.alt || photo.caption || `Wedding photograph ${index + 1}`;
    document.querySelector('#counter').textContent = `${index + 1} / ${photos.length}`;
  }
  function move(step) { if (!photos.length) return; index = (index + step + photos.length) % photos.length; show(); }
  const buttons = photos.map((photo, i) => {
    const button = document.createElement('button'); button.className = 'photo'; button.type = 'button';
    button.setAttribute('aria-label', `Open photograph ${i + 1}`);
    const img = document.createElement('img'); img.src = photo.src; img.alt = photo.alt || photo.caption || `Wedding photograph ${i + 1}`;
    img.loading = 'lazy'; img.decoding = 'async';
    img.style.aspectRatio = '3 / 2';
    const ratio = String(photo.ratio || '').split('/').map(Number);
    if (ratio.length === 2 && ratio.every(n => Number.isFinite(n) && n > 0)) img.style.aspectRatio = `${ratio[0]} / ${ratio[1]}`;
    // Use the image's real proportions once available, even for old manually entered ratios.
    img.addEventListener('load', () => { img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; button.classList.toggle('portrait', img.naturalHeight > img.naturalWidth); });
    button.append(img);
    button.addEventListener('click', () => { index = i; opener = button; show(); dialog.showModal(); document.body.classList.add('viewer-open'); });
    return button;
  });
  grid.replaceChildren(...buttons);
  // Grid's forward-only placement cursor preserves source order by top edge,
  // then left-to-right. Do not use grid-auto-flow:dense: it reorders photos.
  function sizeTile(button) {
    const img = button.querySelector('img');
    const height = img.getBoundingClientRect().height;
    if (height > 0) button.style.gridRowEnd = `span ${Math.ceil(height + 5)}`;
  }
  const tileObserver = new ResizeObserver(entries => {
    entries.forEach(entry => sizeTile(entry.target.parentElement));
  });
  buttons.forEach(button => {
    const img = button.querySelector('img');
    tileObserver.observe(img);
    sizeTile(button);
  });
  document.querySelector('.close').onclick = () => dialog.close();
  document.querySelector('.previous').onclick = () => move(-1);
  document.querySelector('.next').onclick = () => move(1);
  dialog.addEventListener('close', () => { document.body.classList.remove('viewer-open'); if(opener) opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', e => { if(e.target === dialog || e.target === dialog.querySelector('figure')) dialog.close(); });
  dialog.addEventListener('keydown', e => { if(e.key === 'ArrowLeft'){e.preventDefault();move(-1)} if(e.key === 'ArrowRight'){e.preventDefault();move(1)} });
  let start = null;
  enlarged.addEventListener('touchstart', e => { start = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null; }, {passive:true});
  enlarged.addEventListener('touchend', e => { if(!start || !e.changedTouches.length)return; const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y; if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);start=null; }, {passive:true});
  enlarged.addEventListener('touchcancel',()=>{start=null});
})();
