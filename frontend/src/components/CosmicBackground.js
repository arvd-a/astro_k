export default function CosmicBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 2. Deep green radial gradients anchored to viewport corners (opacity 8-12%) */}
      {/* Top Left */}
      <div 
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0) 70%)',
          borderRadius: '50%',
        }}
      />
      
      {/* Bottom Right */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-20%',
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.10) 0%, rgba(74, 222, 128, 0) 70%)',
          borderRadius: '50%',
        }}
      />

      {/* 3. Celestial Blueprint mandala asset, centered, viewport-scaled (opacity 20-25%, mix-blend-mode: screen) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150vmin', /* Viewport scaled to be large and sweeping */
          height: '150vmin',
          backgroundImage: 'url(/mandala.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.22,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}
