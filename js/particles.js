/* ============================================
   PARTICLES.JS – Optimized Canvas Particles
   Minimal CPU usage, smooth performance
   ============================================ */

(function () {
  'use strict';

  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  let width, height;
  let time = 0;

  // Configuration - Performance optimized
  const config = {
    particleCount: 40,
    connectionDistance: 120,
    particleRadius: { min: 1, max: 2 },
    speed: 0.3,
    color: '56, 189, 248',
    colorAlt: '167, 139, 250',
    connectionOpacity: 0.04,
    particleOpacity: { min: 0.1, max: 0.3 },
  };

  function resize() {
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function createParticle() {
    const isAlt = Math.random() > 0.8;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      radius: config.particleRadius.min + Math.random() * (config.particleRadius.max - config.particleRadius.min),
      opacity: config.particleOpacity.min + Math.random() * (config.particleOpacity.max - config.particleOpacity.min),
      color: isAlt ? config.colorAlt : config.color,
    };
  }

  function init() {
    resize();
    particles = [];

    const count = width < 768 ? 20 : width < 1024 ? 30 : config.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    time += 0.016;

    // Draw connections first (background)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          const opacity = (1 - dist / config.connectionDistance) * config.connectionOpacity;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(animate);
  }

  // Start only when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  }, { threshold: 0.1 });

  observer.observe(canvas);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 250);
  });

  init();
  if (document.visibilityState === 'visible') {
    animate();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!animationId) {
      animate();
    }
  });
})();
