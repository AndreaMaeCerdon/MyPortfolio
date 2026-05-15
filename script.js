(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  const CONTACTS = {
    email: {
      mailto: 'Teamandrea.submissions@gmail.com',
      subject: 'Project Inquiry',
    },
    facebook: {
      url: 'https://www.facebook.com/share/1D1P7kRdYF/',
    },
    linkedin: {
      url: 'https://linkedin.com',
    },
    instagram: {
      url: 'https://instagram.com',
    },
  };

  document.body.classList.add('is-loading');

  function showPage() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  }

  if (document.readyState === 'complete') {
    showPage();
  } else {
    window.addEventListener('load', showPage, { once: true });
  }

  /* ——— Contact & button actions ——— */

  function openEmail(subject = CONTACTS.email.subject) {
    const { mailto } = CONTACTS.email;
    window.location.href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}`;
  }

  function openExternalUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openContact(type) {
    const contact = CONTACTS[type];
    if (!contact) return;

    if (contact.mailto) {
      openEmail(contact.subject || CONTACTS.email.subject);
      return;
    }

    if (contact.url) {
      openExternalUrl(contact.url);
    }
  }

  function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    setNav(false);

    const id = target.id;
    if (id) setActive(id);
  }

  function handleAction(action, el) {
    switch (action) {
      case 'scroll':
        scrollToSection(el.getAttribute('data-target') || '#contact');
        break;
      case 'email':
        openEmail();
        break;
      case 'facebook':
        openContact('facebook');
        break;
      case 'linkedin':
        openContact('linkedin');
        break;
      case 'instagram':
        openContact('instagram');
        break;
      default:
        break;
    }
  }

  function initButtons() {
    document.querySelectorAll('.btn-group [data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAction(btn.getAttribute('data-action'), btn);
      });
    });

    document.querySelectorAll('.contact-icons [data-contact]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openContact(link.getAttribute('data-contact'));
      });
    });
  }

  /* ——— Video modal ——— */

  const videoModal = document.getElementById('video-modal');
  const modalPlayer = videoModal?.querySelector('.video-modal-player');
  const previewVideos = document.querySelectorAll('.portfolio-preview');

  function openVideoModal(src) {
    if (!videoModal || !modalPlayer || !src) return;

    previewVideos.forEach((v) => {
      try {
        v.pause();
      } catch (_) {}
    });

    modalPlayer.src = src;
    modalPlayer.muted = false;
    modalPlayer.loop = false;
    modalPlayer.currentTime = 0;

    videoModal.hidden = false;
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const playPromise = modalPlayer.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        modalPlayer.muted = false;
        modalPlayer.play().catch(() => {});
      });
    }

    videoModal.querySelector('.video-modal-close')?.focus();
  }

  function closeVideoModal() {
    if (!videoModal || !modalPlayer) return;

    modalPlayer.pause();
    modalPlayer.removeAttribute('src');
    modalPlayer.load();

    videoModal.hidden = true;
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    previewVideos.forEach((v) => {
      v.play().catch(() => {});
    });
  }

  function initVideoModal() {
    document.querySelectorAll('.portfolio-item[data-video]').forEach((item) => {
      item.addEventListener('click', () => {
        openVideoModal(item.getAttribute('data-video'));
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openVideoModal(item.getAttribute('data-video'));
        }
      });
    });

    videoModal?.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeVideoModal);
    });
  }

  function onEscapeKey(e) {
    if (e.key !== 'Escape') return;

    if (videoModal && !videoModal.hidden) {
      closeVideoModal();
      return;
    }

    setNav(false);
  }

  document.addEventListener('keydown', onEscapeKey);

  /* ——— Mobile nav ——— */

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = document.querySelectorAll('.site-nav a');

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('active', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (navigator.vibrate) {
      navigator.vibrate(open ? [10, 5, 10] : 10);
    }
  }

  toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    setNav(!nav.classList.contains('active'));
  });

  toggle?.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setNav(!nav.classList.contains('active'));
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setNav(false));
  });

  document.addEventListener('click', (e) => {
    if (!nav?.classList.contains('active')) return;
    const header = document.querySelector('.site-header');
    if (header && !header.contains(e.target)) setNav(false);
  });

  /* ——— Smooth scroll (nav links) ——— */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      scrollToSection(href);
    });
  });

  /* ——— Scroll reveal ——— */

  const revealEls = document.querySelectorAll('.section, .card, .portfolio-item');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    revealEls.forEach((el) => el.classList.add('reveal'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('reveal-in'));
  }

  /* ——— Scroll spy ——— */

  const sections = document.querySelectorAll('section[id]');
  const navMap = {};

  sections.forEach((section) => {
    const id = section.id;
    const link = document.querySelector(`.site-nav a[href="#${id}"]`);
    if (link) navMap[id] = link;
  });

  function setActive(id) {
    Object.values(navMap).forEach((l) => l.classList.remove('active-link'));
    navMap[id]?.classList.add('active-link');
  }

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: [0.1, 0.3, 0.6],
      },
    );

    sections.forEach((sec) => spy.observe(sec));
    setActive(sections[0].id);
  }

  /* ——— Init ——— */

  initButtons();
  initVideoModal();

  if (!isTouchDevice) {
    document.querySelectorAll('.btn, .card, .site-nav a, .portfolio-item').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        el.style.filter = 'brightness(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.filter = '';
      });
    });
  }

  if (!prefersReducedMotion && !isTouchDevice) {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
      position: fixed;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(138,43,226,0.35), transparent 70%);
      filter: blur(20px);
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursorGlow);

    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.4 + 0.15,
    }));

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.fillStyle = 'rgba(138,43,226,0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speedY;
        if (p.y > canvas.height) p.y = 0;
      });
      requestAnimationFrame(drawParticles);
    }

    drawParticles();
  }
})();