/* ============================================
   PARTICLES.JS – Enhanced Glassmorphism Plus
   Floating dots with connections, parallax
   Gradient orbs, optimized performance
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
  let time = 0;

  // Configuration - Enhanced
  const config = {
    particleCount: 70,
    connectionDistance: 150,
    particleRadius: { min: 1.2, max: 2.8 },
    speed: { min: 0.12, max: 0.45 },
    color: '56, 189, 248',       // accent cyan RGB
    colorAlt: '167, 139, 250',    // accent violet RGB
    parallaxStrength: 0.015,
    connectionOpacity: 0.06,
    particleOpacity: { min: 0.12, max: 0.45 },
    // Ambient orbs
    orbCount: 3,
    orbRadius: { min: 200, max: 350 },
  };

  // Orbs array
  let orbs = [];

  // Resize handler
  function resize() {
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Create orb
  function createOrb(index) {
    const radius = config.orbRadius.min + Math.random() * (config.orbRadius.max - config.orbRadius.min);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: 0,
      baseY: 0,
      radius: radius,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: index % 2 === 0 ? config.color : config.colorAlt,
      opacity: 0.03 + Math.random() * 0.02,
      pulseSpeed: 0.0005 + Math.random() * 0.0005,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  // Initialize orbs
  function initOrbs() {
    orbs = [];
    for (let i = 0; i < config.orbCount; i++) {
      const orb = createOrb(i);
      orb.baseX = orb.x;
      orb.baseY = orb.y;
      orbs.push(orb);
    }
  }

  // Create particle
  function createParticle() {
    const isAlt = Math.random() > 0.75;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (config.speed.min + Math.random() * (config.speed.max - config.speed.min)),
      vy: (Math.random() - 0.5) * (config.speed.min + Math.random() * (config.speed.max - config.speed.min)),
      radius: config.particleRadius.min + Math.random() * (config.particleRadius.max - config.particleRadius.min),
      opacity: config.particleOpacity.min + Math.random() * (config.particleOpacity.max - config.particleOpacity.min),
      color: isAlt ? config.colorAlt : config.color,
      pulseSpeed: 0.008 + Math.random() * 0.015,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  }

  // Initialize particles
  function init() {
    resize();
    particles = [];
    initOrbs();

    // Adjust count based on screen size for performance
    const count = width < 768 ? Math.floor(config.particleCount * 0.35)
                  : width < 1024 ? Math.floor(config.particleCount * 0.65)
                  : config.particleCount;

    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  // Draw orb
  function drawOrb(orb) {
    const pulse = Math.sin(time * orb.pulseSpeed * 60 + orb.pulsePhase) * 0.3 + 0.7;
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
    gradient.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * pulse})`);
    gradient.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * pulse * 0.5})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Update orb position
  function updateOrb(orb) {
    orb.x += orb.vx;
    orb.y += orb.vy;

    // Slow drift with mouse influence
    const dx = mouseX - orb.x;
    const dy = mouseY - orb.y;
    orb.vx += dx * 0.00001;
    orb.vy += dy * 0.00001;

    // Dampen
    orb.vx *= 0.999;
    orb.vy *= 0.999;

    // Wrap
    if (orb.x < -orb.radius) orb.x = width + orb.radius;
    if (orb.x > width + orb.radius) orb.x = -orb.radius;
    if (orb.y < -orb.radius) orb.y = height + orb.radius;
    if (orb.y > height + orb.radius) orb.y = -orb.radius;
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    time = Date.now() * 0.001;

    // Draw and update orbs
    orbs.forEach(orb => {
      updateOrb(orb);
      drawOrb(orb);
    });

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
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.2 + 0.8;
      const drawX = p.x + parallaxX;
      const drawY = p.y + parallaxY;

      // Draw particle with glow
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity * pulse * 0.2})`;
      ctx.fill();

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
