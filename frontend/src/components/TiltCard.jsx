import React, { useRef, useState } from 'react';

/**
 * TiltCard — wraps children in a 3D-tilting glass panel that
 * reacts to mouse position with a spotlight highlight overlay.
 */
const TiltCard = ({ children, className = '', intensity = 12 }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0) rotateY(0)');
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -intensity;
    const rotateY = ((x - cx) / cx) * intensity;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`);
    setSpotlight({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)');
    setSpotlight((s) => ({ ...s, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-panel-bright ${className}`}
      style={{
        transform,
        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Spotlight overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(6, 182, 212, 0.18) 0%, transparent 60%)`,
          opacity: spotlight.opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
