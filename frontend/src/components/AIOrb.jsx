import React, { useEffect, useRef } from 'react';

const AIOrb = ({ size = 260 }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left - cx,
        y: e.clientY - rect.top - cy,
      };
    };
    canvas.addEventListener('mousemove', onMouseMove);

    let t = 0;
    const POINT_COUNT = 1600;
    const R = size * 0.36;

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, size, size);

      // Outer glow ring
      const outerGrad = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.3);
      outerGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      outerGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.6);
      coreGrad.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      coreGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
      coreGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Morph points on sphere surface
      const rotX = t * 0.4 + mouseRef.current.y * 0.002;
      const rotY = t * 0.6 + mouseRef.current.x * 0.002;

      for (let i = 0; i < POINT_COUNT; i++) {
        const phi   = Math.acos(-1 + (2 * i) / POINT_COUNT);
        const theta = Math.sqrt(POINT_COUNT * Math.PI) * phi;

        // Base sphere coords
        let px = R * Math.sin(phi) * Math.cos(theta);
        let py = R * Math.sin(phi) * Math.sin(theta);
        let pz = R * Math.cos(phi);

        // Noise-like morph
        const noise = Math.sin(px * 0.05 + t) * Math.cos(py * 0.05 + t * 0.7) * 12;
        const nr = R + noise;
        px = nr * Math.sin(phi) * Math.cos(theta);
        py = nr * Math.sin(phi) * Math.sin(theta);
        pz = nr * Math.cos(phi);

        // Rotate Y
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const rx = px * cosY - pz * sinY;
        const rz = px * sinY + pz * cosY;

        // Rotate X
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const ry = py * cosX - rz * sinX;
        const rz2 = py * sinX + rz * cosX;

        // Project
        const fov = 280;
        const z = rz2 + fov;
        const projX = (rx * fov) / z + cx;
        const projY = (ry * fov) / z + cy;

        // Depth-based brightness & hue shift
        const depthFactor = (rz2 + R) / (2 * R); // 0 = back, 1 = front
        const hue = 192 + (1 - depthFactor) * 80; // cyan (192) → purple (272)
        const alpha = depthFactor * 0.7 + 0.05;
        const ptSize = depthFactor * 1.2 + 0.3;

        ctx.beginPath();
        ctx.arc(projX, projY, ptSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
        ctx.fill();
      }

      // Rotating outer ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.2, R * 0.25, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.3 + 1.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.1, R * 0.2, Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.4)) drop-shadow(0 0 80px rgba(168, 85, 247, 0.2))',
        cursor: 'none',
      }}
    />
  );
};

export default AIOrb;
