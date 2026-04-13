'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Constellation star data - random positions for the background
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

// Zodiac symbols for the orbiting ring
const ZODIAC = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef([]);
  const animFrameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // --- Cursor Trail Canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Add trail particle
      for (let i = 0; i < 2; i++) {
        trailRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 3 + 1,
          hue: Math.random() > 0.5 ? 45 : 145, // gold or green
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw trail particles
      trailRef.current = trailRef.current.filter(p => p.life > 0);
      
      for (const p of trailRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.99;

        const alpha = p.life * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw cursor glow
      const glow = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 120
      );
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
      glow.addColorStop(0.5, 'rgba(74, 222, 128, 0.03)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Cursor trail canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      {/* Animated stars background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 1 }}>
        {STARS.map(star => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              background: star.size > 2 ? '#FBBF24' : '#ffffff',
              boxShadow: star.size > 2
                ? '0 0 6px rgba(251, 191, 36, 0.6)'
                : '0 0 3px rgba(255, 255, 255, 0.4)',
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Orbiting zodiac ring */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        height: '520px',
        zIndex: 2,
        animation: 'orbitSpin 60s linear infinite',
        opacity: 0.12,
      }}>
        {ZODIAC.map((sign, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + 48 * Math.cos(angle);
          const y = 50 + 48 * Math.sin(angle);
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '1.6rem',
                color: '#FBBF24',
              }}
            >
              {sign}
            </span>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        {/* Glowing logo */}
        <div
          className={loaded ? 'hero-appear' : ''}
          style={{
            marginBottom: '16px',
            opacity: 0,
          }}
        >
          <div style={{
            fontSize: '3rem',
            marginBottom: '8px',
            filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))',
          }}>
            ✦
          </div>
        </div>

        {/* Title */}
        <h1
          className={loaded ? 'hero-appear' : ''}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FBBF24, #FCD34D, #FBBF24)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '20px',
            animation: 'shimmer 4s ease-in-out infinite',
            opacity: 0,
            animationDelay: '0.2s',
          }}
        >
          Astro K
        </h1>

        {/* Subtitle */}
        <p
          className={loaded ? 'hero-appear' : ''}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: '#94A3B8',
            maxWidth: '600px',
            lineHeight: 1.6,
            marginBottom: '12px',
            opacity: 0,
            animationDelay: '0.4s',
          }}
        >
          Privacy-first, ephemeral Vedic astrology chart engine
        </p>

        {/* Tagline */}
        <p
          className={loaded ? 'hero-appear' : ''}
          style={{
            fontSize: '0.9rem',
            color: 'rgba(148, 163, 184, 0.5)',
            maxWidth: '500px',
            lineHeight: 1.6,
            marginBottom: '48px',
            opacity: 0,
            animationDelay: '0.6s',
          }}
        >
          Powered by Swiss Ephemeris • NASA JPL precision • No data stored
        </p>

        {/* CTA Button */}
        <div
          className={loaded ? 'hero-appear' : ''}
          style={{ opacity: 0, animationDelay: '0.8s' }}
        >
          <button
            onClick={() => router.push('/chart')}
            id="cta-generate"
            style={{
              padding: '16px 48px',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '12px',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))',
              color: '#FBBF24',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.02em',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(217, 119, 6, 0.2))';
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.7)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 32px rgba(251, 191, 36, 0.2)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))';
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.4)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Generate Your Chart ✦
          </button>
        </div>

        {/* Feature pills */}
        <div
          className={loaded ? 'hero-appear' : ''}
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '64px',
            opacity: 0,
            animationDelay: '1.2s',
          }}
        >
          {[
            { icon: '🔒', text: 'Zero Data Storage' },
            { icon: '🪐', text: 'Swiss Ephemeris' },
            { icon: '✦', text: 'AI Astrologer' },
            { icon: '📄', text: 'PDF Export' },
          ].map((feat, i) => (
            <div
              key={i}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.8rem',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{feat.icon}</span>
              {feat.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
