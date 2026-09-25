// ===================================================================
// Boot screen
// ===================================================================
const boot = document.getElementById('boot');
const bootStart = document.getElementById('bootStart');
let booted = false;

function dismissBoot() {
  if (booted || !boot) return;
  booted = true;
  boot.classList.add('is-hidden');
  document.body.style.overflow = '';
  runHeroReveal();
}

if (boot) {
  document.body.style.overflow = 'hidden';
  bootStart.addEventListener('click', dismissBoot);
  window.addEventListener('keydown', dismissBoot, { once: true });
  boot.addEventListener('click', (e) => {
    if (e.target === boot || e.target.closest('.boot-grid')) dismissBoot();
  });
  // Safety net so nobody gets stuck on the boot screen
  setTimeout(dismissBoot, 5000);
} else {
  runHeroReveal();
}

// ===================================================================
// Hero reveal: progress bar fill, once, after boot
// ===================================================================
function runHeroReveal() {
  const fill = document.getElementById('heroProgressFill');
  if (fill) {
    requestAnimationFrame(() => {
      setTimeout(() => { fill.style.width = '72%'; }, 150);
    });
  }
}

// ===================================================================
// Mobile nav toggle
// ===================================================================
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  primaryNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===================================================================
// Scroll-spy
// ===================================================================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const linkFor = (id) => document.querySelector(`.nav-link[href="#${id}"]`);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          const activeLink = linkFor(entry.target.id);
          if (activeLink) activeLink.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => spy.observe(section));
}

// ===================================================================
// Stat bars: fill in once when scrolled into view
// ===================================================================
const statEls = document.querySelectorAll('.stat[data-fill]');
if (statEls.length && 'IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const pct = el.getAttribute('data-fill');
          const bar = el.querySelector('.stat-fill');
          if (bar) bar.style.width = pct + '%';
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach((el) => statObserver.observe(el));
} else {
  // No IntersectionObserver support: just fill immediately
  statEls.forEach((el) => {
    const bar = el.querySelector('.stat-fill');
    if (bar) bar.style.width = el.getAttribute('data-fill') + '%';
  });
}

// ===================================================================
// Achievements: pop animation + "collect them all" easter egg
// ===================================================================
const achEls = document.querySelectorAll('[data-ach]');
const collected = new Set();

function popAchievement(el) {
  el.classList.remove('is-popped');
  // force reflow so the animation can restart
  void el.offsetWidth;
  el.classList.add('is-popped');
  collected.add(el);
  if (collected.size === achEls.length) {
    celebrate();
  }
}

achEls.forEach((el) => {
  el.addEventListener('click', () => popAchievement(el));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      popAchievement(el);
    }
  });
});

function celebrate() {
  showToast('All ten collected — full trophy case!');
  const layer = document.getElementById('confetti');
  if (!layer) return;
  const colors = ['#5EEAD4', '#B98CFF', '#FFC857', '#FF7A9C'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  for (let i = 0; i < 60; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti-bit';
    bit.style.left = Math.random() * 100 + 'vw';
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = (Math.random() * 0.6) + 's';
    bit.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
    layer.appendChild(bit);
    setTimeout(() => bit.remove(), 3600);
  }
}

// ===================================================================
// Level map: click a node to populate the detail panel
// ===================================================================
const levelNodes = document.querySelectorAll('.level-node');
const levelDetailTitle = document.getElementById('levelDetailTitle');
const levelDetailSchool = document.getElementById('levelDetailSchool');
const levelDetailScore = document.getElementById('levelDetailScore');

levelNodes.forEach((node) => {
  node.addEventListener('click', () => {
    levelNodes.forEach((n) => n.classList.remove('is-active'));
    node.classList.add('is-active');
    if (levelDetailTitle) levelDetailTitle.textContent = node.getAttribute('data-title');
    if (levelDetailSchool) levelDetailSchool.textContent = node.getAttribute('data-school');
    if (levelDetailScore) levelDetailScore.textContent = node.getAttribute('data-score');
  });
});

// Mark the current node active by default
const currentNode = document.querySelector('.level-node.is-current');
if (currentNode) currentNode.classList.add('is-active');

// ===================================================================
// Badge case: little flip flourish on click
// ===================================================================
document.querySelectorAll('.gbadge').forEach((badge) => {
  const flip = () => {
    badge.classList.remove('is-flipped');
    void badge.offsetWidth;
    badge.classList.add('is-flipped');
  };
  badge.addEventListener('click', flip);
  badge.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
});

// ===================================================================
// Copy-to-clipboard (save slots)
// ===================================================================
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

document.querySelectorAll('[data-copy]').forEach((card) => {
  card.addEventListener('click', async () => {
    const value = card.getAttribute('data-copy');
    const label = card.getAttribute('data-label') || 'Text';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const temp = document.createElement('textarea');
        temp.value = value;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showToast(`${label} copied — ${value}`);
    } catch (err) {
      showToast(`Copy this: ${value}`);
    }
  });
});

// ===================================================================
// Footer year
// ===================================================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
