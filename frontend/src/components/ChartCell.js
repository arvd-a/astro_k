import Planet from './Planet';
import { getPlanetPositions } from '../lib/chartGeometry';

export default function ChartCell({ 
  index, 
  polygon, 
  center, 
  signIndex, 
  signName, 
  planets = [] 
}) {
  // Compute positions dynamically based on how many planets are in this house
  const positions = getPlanetPositions(center.x, center.y, planets.length);

  // Slight color overlay for the background
  const fillClass = `hsla(${signIndex * 30}, 30%, 50%, 0.05)`;

  return (
    <g className="chart-cell">
      <polygon 
        points={polygon} 
        fill={fillClass} 
        stroke="var(--gold)" 
        strokeWidth="1"
        style={{ transition: 'fill 0.2s', opacity: 0.8 }}
      />
      
      {/* House Number - Top Corner/Edge based on center relative to cell 
          For MVP, just placing it nicely above the center. */}
      <text 
        x={center.x} 
        y={center.y - 20} 
        textAnchor="middle" 
        style={{ 
          fill: 'var(--text-secondary)', 
          fontSize: '12px', 
          opacity: 0.5 
        }}
      >
        {index === 0 ? "1/Asc" : index + 1}
      </text>

      {/* Sign Number / Abbreviation */}
      <text 
        x={center.x} 
        y={center.y + 35} 
        textAnchor="middle" 
        style={{ 
          fill: 'var(--text-primary)', 
          fontSize: '12px', 
          opacity: 0.7 
        }}
      >
        {signIndex + 1} {/* Traditional numbering: 1=Aries ... 12=Pisces */}
      </text>

      {/* Planets */}
      {planets.map((p, i) => (
        <Planet 
          key={p.id} 
          planet={p} 
          x={positions[i].x} 
          y={positions[i].y} 
        />
      ))}
    </g>
  );
}
