'use client';

import { CHART_SIZE, CHART_POLYGONS, CELL_CENTERS } from '../lib/chartGeometry';
import ChartCell from './ChartCell';
import AspectLines from './AspectLines';

export default function NorthIndianChart({ chartData, showAspects, aspects }) {
  if (!chartData) return null;

  const ascendantSignIndex = chartData.ascendant.sign_index;
  const planets = chartData.planets;
  const houses = chartData.houses; // This contains the house number mapping relative to Ascendant

  // Pre-process planets: group by their cell index
  const planetsByCell = Array(12).fill().map(() => []);
  
  planets.forEach(p => {
    // Determine which cell this planet belongs to.
    // Cell 0 is the Ascendant (top diamond).
    // The house cell offset is (planet.sign_index - ascendant.sign_index + 12) % 12
    const cellIndex = (p.sign_index - ascendantSignIndex + 12) % 12;
    planetsByCell[cellIndex].push(p);
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto', aspectRatio: '1/1' }}>
      <svg 
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} 
        width="100%" 
        height="100%"
        style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.1))' }}
      >
        {/* Outer Rect Border */}
        <rect 
          x="0" y="0" 
          width={CHART_SIZE} height={CHART_SIZE} 
          fill="none" 
          stroke="var(--gold)" 
          strokeWidth="2" 
        />
        
        {/* The 12 House Cells */}
        {CHART_POLYGONS.map((polygon, index) => {
          // The sign present in this cell
          const cellSignIndex = (ascendantSignIndex + index) % 12;
          
          return (
            <ChartCell
              key={`cell-${index}`}
              index={index}
              polygon={polygon}
              center={CELL_CENTERS[index]}
              signIndex={cellSignIndex}
              planets={planetsByCell[index]} // Only pass the planets falling in this exact cell
            />
          );
        })}

        {/* Highlight Ascendant Exact Degree Line (optional polish) */}
        {/* <circle cx={CELL_CENTERS[0].x} cy={CELL_CENTERS[0].y - 30} r="3" fill="var(--gold)" /> */}

        {/* Aspect Lines */}
        {showAspects && <AspectLines aspects={aspects} />}
      </svg>
    </div>
  );
}
