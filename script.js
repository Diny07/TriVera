(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA_NUMBER = '6281234567890'; // TODO: ganti dengan nomor WhatsApp asli TriVera

  /* ============================================================
     Tahun berjalan di footer
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     Header: shrink + scroll progress bar saat scroll
     ============================================================ */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (header) header.classList.toggle('scrolled', scrollY > 40);
    if (progressBar) progressBar.style.width = progress + '%';
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     Navigasi mobile
     ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('mobile-open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     Scroll reveal (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ============================================================
   Testimonial slider
   ============================================================ */
const testiTrack = document.getElementById('testiTrack');
const testiDotsWrap = document.getElementById('testiDots');
const testiPrev = document.getElementById('testiPrev');
const testiNext = document.getElementById('testiNext');

if (testiTrack && testiDotsWrap) {
  const slides = Array.from(testiTrack.querySelectorAll('.testi-card'));
  let current = 0;
  let autoTimer = null;

  function getSlideWidth() {
    return testiTrack.parentElement.clientWidth;
  }

  function goTo(index, animate = true) {
    if (!slides.length) return;

    current = (index + slides.length) % slides.length;

    const slideWidth = getSlideWidth();
    const offset = current * slideWidth;

    testiTrack.style.transition = animate && !prefersReducedMotion
      ? 'transform .6s cubic-bezier(.16,.84,.44,1)'
      : 'none';

    testiTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('span');

    if (i === 0) {
      dot.classList.add('active');
    }

    dot.addEventListener('click', () => {
      goTo(i);
      startAuto();
    });

    testiDotsWrap.appendChild(dot);
  });

  const dots = Array.from(testiDotsWrap.children);

  function startAuto() {
    stopAuto();

    if (!prefersReducedMotion && slides.length > 1) {
      autoTimer = setInterval(() => {
        goTo(current + 1);
      }, 5500);
    }
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  testiNext?.addEventListener('click', () => {
    goTo(current + 1);
    startAuto();
  });

  testiPrev?.addEventListener('click', () => {
    goTo(current - 1);
    startAuto();
  });

  testiTrack.style.display = 'flex';

  slides.forEach((slide) => {
    slide.style.flex = '0 0 100%';
  });

  goTo(0, false);
  startAuto();

  const sliderWrap = document.querySelector('.testi-slider');

  if (sliderWrap) {
    sliderWrap.addEventListener('mouseenter', stopAuto);
    sliderWrap.addEventListener('mouseleave', startAuto);
  }

  window.addEventListener('resize', () => {
    goTo(current, false);
  });
}

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    question && question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ============================================================
     Form kontak -> kirim otomatis ke WhatsApp
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = contactForm.nama.value.trim();
      const layanan = contactForm.layanan.value;
      const pesan = contactForm.pesan.value.trim();

      let valid = true;
      clearErrors();

      if (!nama) {
        showError('nama', 'Nama wajib diisi.');
        valid = false;
      }
      if (!pesan) {
        showError('pesan', 'Ceritakan sedikit kebutuhan kamu ya.');
        valid = false;
      }
      if (!valid) return;

      const text =
  `Halo TriVera, saya ${nama}.\n\n` +
  `Saya ingin berkonsultasi mengenai:\n` +
  `Layanan: ${layanan || 'Belum ditentukan'}\n\n` +
  `Kebutuhan saya:\n` +
  `${pesan}`;

      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
      contactForm.reset();
    });

    function showError(field, message) {
      const row = contactForm.querySelector(`[name="${field}"]`).closest('.form-row');
      const errEl = contactForm.querySelector(`[data-error="${field}"]`);
      if (row) row.classList.add('invalid');
      if (errEl) errEl.textContent = message;
    }
    function clearErrors() {
      contactForm.querySelectorAll('.form-row').forEach((row) => row.classList.remove('invalid'));
      contactForm.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
    }
  }

  /* ============================================================
     Particle canvas ambient di hero
     ============================================================ */
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('hero');
    let particles = [];
    let width, height, rafId;

    function resize() {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      const count = Math.min(60, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 106, ${p.alpha})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      createParticles();
      cancelAnimationFrame(rafId);
      draw();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 200);
    });

    init();
  }
})();
/* ============================================================
   Lucide Icons
   ============================================================ */
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}