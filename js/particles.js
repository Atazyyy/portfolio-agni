/* ============================================
   PARTICLES.JS – Interactive Mouse-Following Particles
   Cursor trail with connected particles
   ============================================ */

(function () {
  'use strict';

  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  let mouse = { x: null, y: null };
  let width, height;

  const config = {
    particleCount: 35,
    connectionDistance: 100,
    particleRadius: { min: 1, max: 2.5 },
    speed: 0.4,
    color: '56, 189, 248',
    colorAlt: '167, 139, 250',
    connectionOpacity: 0.05,
    particleOpacity: { min: 0.1, max: 0.35 },
    mouseRadius: 150,
    mouseStrength: 0.08,
  };

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth * window.devicePixelRatio;
    height = canvas.height = canvas.parentElement.offsetHeight * window.devicePixelRatio;
    canvas.style.width = width / window.devicePixelRatio + 'px';
    canvas.style.height = height / window.devicePixelRatio + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    width /= window.devicePixelRatio;
    height /= window.devicePixelRatio;
  }

  function createParticle(x, y) {
    const isAlt = Math.random() > 0.8;
    return {
      x: x !== undefined ? x : Math.random() * width,
      y: y !== undefined ? y : Math.random() * height,
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
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function drawConnections() {
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
  }

  function drawMouseConnection() {
    if (mouse.x === null || mouse.y === null) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < config.mouseRadius) {
        const opacity = (1 - dist / config.mouseRadius) * 0.15;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Mouse cursor glow
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse attraction/repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius) {
          const force = (config.mouseRadius - dist) / config.mouseRadius;
          p.vx += (dx / dist) * force * config.mouseStrength;
          p.vy += (dy / dist) * force * config.mouseStrength;
        }
      }

      // Apply velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Keep some random movement
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;

      // Wrap edges
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

    // Draw connection lines
    drawConnections();
    drawMouseConnection();

    animationId = requestAnimationFrame(animate);
  }

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Touch support
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Visibility optimization
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  // Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 200);
  });

  init();
  animate();
})();
