import React, { useEffect, useRef } from 'react';

const CinematicBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const spotlightRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // --- GRID ---
    const GRID_SIZE = 60;

    // --- PARTICLES ---
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      hue: Math.random() < 0.6 ? 192 : 270, // cyan vs purple
    }));

    // --- AURORA BLOBS ---
    const blobs = [
      { x: W * 0.2, y: H * 0.15, r: 350, hue: 192, phase: 0 },
      { x: W * 0.75, y: H * 0.7,  r: 400, hue: 270, phase: 2 },
      { x: W * 0.5,  y: H * 0.5,  r: 280, hue: 230, phase: 4 },
    ];

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    let t = 0;
    const draw = () => {
      t += 0.008;

      // Smooth spotlight tracking
      const sp = spotlightRef.current;
      const mx = mouseRef.current;
      sp.x += (mx.x - sp.x) * 0.06;
      sp.y += (mx.y - sp.y) * 0.06;

      // Background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Aurora blobs
      blobs.forEach((b) => {
        b.x += Math.sin(t + b.phase) * 0.4;
        b.y += Math.cos(t * 0.7 + b.phase) * 0.3;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `hsla(${b.hue}, 90%, 55%, 0.08)`);
        grad.addColorStop(1, `hsla(${b.hue}, 90%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid overlay
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Cursor spotlight
      const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 300);
      sg.addColorStop(0, 'rgba(6, 182, 212, 0.06)');
      sg.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);

      // Particles
      particles.forEach((p) => {
        // Mouse repel
        const dx = p.x - mx.x;
        const dy = p.y - mx.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
        ctx.fill();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
      }}
    />
  );
};

export default CinematicBackground;
