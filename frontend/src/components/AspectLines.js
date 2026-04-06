import { CELL_CENTERS } from '../lib/chartGeometry';

export default function AspectLines({ aspects }) {
  if (!aspects || aspects.length === 0) return null;

  return (
    <g className="aspect-lines" style={{ pointerEvents: 'none' }}>
      {aspects.map((aspect, i) => {
        const start = CELL_CENTERS[aspect.sourceHouseCell];
        const end = CELL_CENTERS[aspect.targetHouseCell];
        
        // Highlight different types of aspects
        const strokeOpacity = aspect.type === 'special' ? 0.4 : 0.2;
        const strokeDasharray = aspect.type === 'special' ? '4,4' : 'none';

        return (
          <line
            key={`${aspect.sourceElementId}-${i}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </g>
  );
}
