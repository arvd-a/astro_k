import { PLANETS } from '../lib/constants';

export default function Planet({ planet, x, y }) {
  // Rahu and Ketu always get the R suffix visually.
  const isNodes = planet.id === 'ra' || planet.id === 'ke';
  const showRetro = isNodes || planet.is_retrograde;

  return (
    <g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}>
      <title>{`${planet.name} in ${planet.sign_name} at ${planet.sign_degree.toFixed(2)}° (Nakshatra: ${planet.nakshatra_index}, Pada: ${planet.nakshatra_pada})`}</title>
      
      <circle cx="0" cy="-4" r="10" fill="transparent" /> {/* Hitbox */}
      
      <text 
        x="0" 
        y="0" 
        textAnchor="middle" 
        className="text-gold"
        style={{ 
          fontSize: '14px', 
          fontWeight: 600,
          fill: 'var(--gold)',
          transition: 'fill 0.2s ease',
        }}
      >
        {PLANETS[planet.id]?.symbol || planet.id.toUpperCase()}
        {showRetro && (
          <tspan style={{ fontSize: '10px', fill: 'var(--gold)' }} dx="1" dy="-4">(R)</tspan>
        )}
      </text>
    </g>
  );
}
