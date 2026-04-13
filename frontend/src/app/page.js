'use client';

import { useEffect, useState } from 'react';
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>

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
