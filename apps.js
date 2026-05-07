/* ═══════════════════════════════════════════════════════
   MessGenks — apps.js
   Features:
   · Filter photos & videos
   · Pagination: 50 foto untuk "all", 20 untuk filter spesifik
   · Slideshow lightbox (swipe + arrow key + button)
   · Video modal with auto-thumbnail generation
   · Smooth scroll nav
   · Scroll-in animation
═══════════════════════════════════════════════════════ */

// ── GLOBALS ──────────────────────────────────────────
const PAGE_SIZE_ALL    = 50;   // max awal untuk filter "semua"
const PAGE_SIZE_FILTER = 20;   // max awal untuk filter spesifik
const LOAD_MORE_SIZE   = 20;   // tiap klik "muat lebih banyak"

let currentPhotoIndex = 0;
let visiblePhotoCards = [];

const filterPage  = {};   // { filter -> currentPage }
let   activeFilter = 'all';

// ── HELPERS ───────────────────────────────────────────
function getInitialSize(filter) {
  return filter === 'all' ? PAGE_SIZE_ALL : PAGE_SIZE_FILTER;
}

function getCurrentLimit(filter) {
  const page    = filterPage[filter] || 1;
  const initial = getInitialSize(filter);
  // page 1 = initial size, page 2+ adds LOAD_MORE_SIZE each time
  return initial + Math.max(0, page - 1) * LOAD_MORE_SIZE;
}

// ── PAGINATION CORE ───────────────────────────────────
function applyPage(filter) {
  if (!filterPage[filter]) filterPage[filter] = 1;

  const limit    = getCurrentLimit(filter);
  const allCards = Array.from(document.querySelectorAll('#photo-grid .photo-card'));
  const matched  = allCards.filter(c =>
    filter === 'all' || c.dataset.moment === filter
  );

  // cards that don't belong → always hide
  allCards.forEach(c => {
    const belongs = filter === 'all' || c.dataset.moment === filter;
    if (!belongs) {
      c.classList.add('hidden');
      c.classList.remove('paged-hidden');
    }
  });

  // within matched: show up to limit, hide rest
  matched.forEach((c, i) => {
    c.classList.remove('hidden');
    if (i < limit) {
      if (c.classList.contains('paged-hidden')) {
        c.classList.remove('paged-hidden');
        // animate newly revealed cards
        const slot = i % LOAD_MORE_SIZE;
        setTimeout(() => c.classList.add('in-view'), slot * 45);
      } else if (!c.classList.contains('in-view')) {
        const slot = i % PAGE_SIZE_ALL;
        setTimeout(() => c.classList.add('in-view'), slot * 40);
      }
    } else {
      c.classList.add('paged-hidden');
    }
  });

  updateLoadMoreBtn(matched.length, limit, filter);
  updatePhotoEmpty(matched.length);

  // rebuild slideshow list
  visiblePhotoCards = matched.filter((_, i) => i < limit);
}

function updateLoadMoreBtn(total, shown, filter) {
  let wrap = document.getElementById('load-more-wrap');

  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'load-more-wrap';
    wrap.innerHTML = `
      <button id="load-more-btn" onclick="loadMorePhotos()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round" id="load-more-icon">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        <span id="load-more-label">Muat Lebih Banyak</span>
        <span id="load-more-count"></span>
      </button>`;
    const grid = document.getElementById('photo-grid');
    grid.insertAdjacentElement('afterend', wrap);
  }

  const remaining = total - shown;

  if (remaining <= 0) {
    wrap.style.display = 'none';
  } else {
    wrap.style.display  = 'flex';
    const next = Math.min(remaining, LOAD_MORE_SIZE);
    document.getElementById('load-more-count').textContent =
      `+${next} foto · ${remaining} tersisa`;
  }
}

function updatePhotoEmpty(matchCount) {
  document.getElementById('photo-empty')
    .classList.toggle('visible', matchCount === 0);
}

function loadMorePhotos() {
  filterPage[activeFilter] = (filterPage[activeFilter] || 1) + 1;
  applyPage(activeFilter);
}

// ── FILTER PHOTOS ────────────────────────────────────
function filterPhotos(filter, btn) {
  document.querySelectorAll('#photo-filter .filter-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  activeFilter = filter;
  if (!filterPage[filter]) filterPage[filter] = 1;

  applyPage(filter);
}

// ── FILTER VIDEOS ─────────────────────────────────────
function filterVideos(filter, btn) {
  document.querySelectorAll('#video-filter .filter-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('#video-grid .video-card');
  let visible = 0;
  cards.forEach(card => {
    const match = filter === 'all' || card.dataset.moment === filter;
    card.classList.toggle('hidden', !match);
    if (match) visible++;
  });
  document.getElementById('video-empty').classList.toggle('visible', visible === 0);
}

// ── SLIDESHOW LIGHTBOX ────────────────────────────────
function buildVisibleList() {
  visiblePhotoCards = Array.from(
    document.querySelectorAll(
      '#photo-grid .photo-card:not(.hidden):not(.paged-hidden)'
    )
  );
}

function openLightbox(card) {
  if (card.classList.contains('paged-hidden')) return;
  buildVisibleList();
  currentPhotoIndex = visiblePhotoCards.indexOf(card);
  showSlide(currentPhotoIndex);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showSlide(index) {
  if (!visiblePhotoCards.length) return;
  if (index < 0)                         index = visiblePhotoCards.length - 1;
  if (index >= visiblePhotoCards.length) index = 0;
  currentPhotoIndex = index;

  const card    = visiblePhotoCards[currentPhotoIndex];
  const img     = card.querySelector('img');
  const caption = card.querySelector('.photo-caption');

  const lbImg = document.getElementById('lightbox-img');
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = img.src;
    lbImg.style.opacity = '1';
  }, 150);

  document.getElementById('lightbox-caption').textContent =
    caption ? caption.textContent.trim() : '';

  const counter = document.getElementById('lightbox-counter');
  if (counter) counter.textContent =
    `${currentPhotoIndex + 1} / ${visiblePhotoCards.length}`;
}

function slidePrev() { showSlide(currentPhotoIndex - 1); }
function slideNext() { showSlide(currentPhotoIndex + 1); }

function closeLightbox(e) {
  if (!e ||
      e.target === document.getElementById('lightbox') ||
      e.currentTarget.classList.contains('lightbox-close')) {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── VIDEO AUTO-THUMBNAIL ──────────────────────────────
function generateVideoThumbnail(videoSrc, imgEl) {
  const video       = document.createElement('video');
  video.src         = videoSrc;
  video.crossOrigin = 'anonymous';
  video.muted       = true;
  video.preload     = 'metadata';

  video.addEventListener('loadedmetadata', () => {
    video.currentTime = Math.min(Math.max(video.duration * 0.2, 1), video.duration - 0.1);
  });

  video.addEventListener('seeked', () => {
    const canvas  = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 360;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    imgEl.src = canvas.toDataURL('image/jpeg', 0.8);
    video.src = '';
  });

  video.load();
}

// ── VIDEO MODAL ───────────────────────────────────────
function openVideoModal(title, videoSrc) {
  const modal   = document.getElementById('video-modal');
  const video   = document.getElementById('modal-video');
  const titleEl = document.getElementById('modal-title');

  titleEl.textContent = title;
  video.src = videoSrc;
  video.load();
  video.play().catch(() => {});
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal(e) {
  if (!e ||
      e.target === document.getElementById('video-modal') ||
      e.currentTarget.classList.contains('lightbox-close')) {
    const video = document.getElementById('modal-video');
    video.pause();
    video.src = '';
    document.getElementById('video-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── KEYBOARD NAVIGATION ───────────────────────────────
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (e.key === 'Escape') { closeLightbox(); closeVideoModal(); }
  if (lb.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  slidePrev();
    if (e.key === 'ArrowRight') slideNext();
  }
});

// ── TOUCH / SWIPE ─────────────────────────────────────
(function initSwipe() {
  let startX = 0;
  const lb = document.getElementById('lightbox');

  lb.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? slideNext() : slidePrev();
    }
  }, { passive: true });
})();

// ── SMOOTH SCROLL ─────────────────────────────────────
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── SCROLL-IN ANIMATION (video cards) ────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), (i % 8) * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.video-card').forEach(c => observer.observe(c));

// ── INIT VIDEO THUMBNAILS ─────────────────────────────
function initVideoThumbnails() {
  document.querySelectorAll('.video-card').forEach(card => {
    const onclick = card.getAttribute('onclick') || '';
    const match   = onclick.match(/'([^']+\.(mp4|mov|MOV|MP4|webm))'(?:\s*\))?$/i);
    if (!match) return;

    const videoSrc = match[1];
    let imgEl = card.querySelector('.video-thumb img');
    if (!imgEl) {
      imgEl = document.createElement('img');
      imgEl.alt = 'Video thumbnail';
      imgEl.style.cssText =
        'width:100%;height:100%;object-fit:cover;opacity:.75;transition:opacity .3s,transform .5s';
      const thumb = card.querySelector('.video-thumb');
      if (thumb) thumb.insertBefore(imgEl, thumb.firstChild);
    }
    generateVideoThumbnail(videoSrc, imgEl);
  });
}

// ── INIT ON DOM READY ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initVideoThumbnails();

  activeFilter      = 'all';
  filterPage['all'] = 1;
  applyPage('all');
});