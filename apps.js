// ── FILTER PHOTOS ──
function filterPhotos(filter, btn) {
  document.querySelectorAll('#photo-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('#photo-grid .photo-card');
  let visible = 0;
  cards.forEach(card => {
    const match = filter === 'all' || card.dataset.moment === filter;
    card.classList.toggle('hidden', !match);
    if (match) visible++;
  });
  document.getElementById('photo-empty').classList.toggle('visible', visible === 0);
}

// ── FILTER VIDEOS ──
function filterVideos(filter, btn) {
  document.querySelectorAll('#video-filter .filter-btn').forEach(b => b.classList.remove('active'));
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

// ── LIGHTBOX ──
function openLightbox(card) {
  const img = card.querySelector('img');
  const caption = card.querySelector('.photo-caption');
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox-caption').textContent = caption ? caption.textContent : '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (!e || e.target === document.getElementById('lightbox') || e.currentTarget.tagName === 'BUTTON') {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── VIDEO MODAL (support local .mp4) ──
function openVideoModal(title, videoSrc) {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  const titleEl = document.getElementById('modal-title');

  titleEl.textContent = title;
  video.src = videoSrc;
  video.load();
  video.play().catch(() => {}); // autoplay might be blocked, no error

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal(e) {
  if (!e || e.target === document.getElementById('video-modal') || e.currentTarget.tagName === 'BUTTON') {
    const video = document.getElementById('modal-video');
    video.pause();
    video.src = '';
    document.getElementById('video-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── KEYBOARD ESC ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeVideoModal();
  }
});

// ── SMOOTH SCROLL ──
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── STAGGER ANIMATION ON SCROLL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, (i % 8) * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.photo-card, .video-card').forEach(c => observer.observe(c));