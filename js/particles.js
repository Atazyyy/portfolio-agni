/* ============================================
   PARTICLES.JS – Lightweight Canvas Particles
   Floating dots with connections, parallax
   Only renders on elements with .hero-canvas
   ============================================ */

(function () {
  'use strict';

  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let width, height;

  // Configuration
  const config = {
    particleCount: 60,
    connectionDistance: 140,
    particleRadius: { min: 1, max: 2.5 },
    speed: { min: 0.15, max: 0.5 },
    color: '56, 189, 248',       // accent color RGB
    colorAlt: '129, 140, 248',   // secondary accent RGB
    parallaxStrength: 0.02,
    connectionOpacity: 0.08,
    particleOpacity: { min: 0.15, max: 0.5 },
  };

  // Resize handler
  function resize() {
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Create particle
  function createParticle() {
    const isAlt = Math.random() > 0.7;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (config.speed.min + Math.random() * (config.speed.max - config.speed.min)),
      vy: (Math.random() - 0.5) * (config.speed.min + Math.random() * (config.speed.max - config.speed.min)),
      radius: config.particleRadius.min + Math.random() * (config.particleRadius.max - config.particleRadius.min),
      opacity: config.particleOpacity.min + Math.random() * (config.particleOpacity.max - config.particleOpacity.min),
      color: isAlt ? config.colorAlt : config.color,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  // Initialize particles
  function init() {
    resize();
    particles = [];

    // Adjust count based on screen size for performance
    const count = width < 768 ? Math.floor(config.particleCount * 0.4)
                  : width < 1024 ? Math.floor(config.particleCount * 0.7)
                  : config.particleCount;

    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    const time = Date.now() * 0.001;

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Add parallax offset
      const parallaxX = (mouseX - width / 2) * config.parallaxStrength;
      const parallaxY = (mouseY - height / 2) * config.parallaxStrength;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Pulse opacity
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.15 + 0.85;
      const drawX = p.x + parallaxX;
      const drawY = p.y + parallaxY;

      // Draw particle
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity * pulse})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = (p.x + parallaxX) - (p2.x + parallaxX);
        const dy = (p.y + parallaxY) - (p2.y + parallaxY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = (1 - distance / config.connectionDistance) * config.connectionOpacity;
          ctx.beginPath();
          ctx.moveTo(p.x + parallaxX, p.y + parallaxY);
          ctx.lineTo(p2.x + parallaxX, p2.y + parallaxY);
          ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Visibility optimization
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  // Window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      init();
    }, 200);
  }, { passive: true });

  // Start
  init();
  animate();

})();
