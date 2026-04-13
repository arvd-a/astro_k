'use client';

export default function ChartControls({ 
  showAspects, 
  setShowAspects, 
  onExportPdf, 
  loadingPdf, 
  metadata
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          className={`btn btn-astro ${showAspects ? 'active' : ''}`}
          onClick={() => setShowAspects(!showAspects)}
        >
          {showAspects ? 'Hide Aspects (Drishti)' : 'Show Aspects (Drishti)'}
        </button>
        
        <button 
          className="btn btn-system"
          onClick={onExportPdf}
          disabled={loadingPdf || !metadata}
        >
          {loadingPdf ? 'Generating PDF...' : 'Export PDF'}
        </button>
      </div>

      {metadata && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>JD: {metadata.julian_day} | {metadata.ayanamsa}{metadata.topocentric ? ' | Topocentric' : ''}</div>
          <div>{metadata.user_location.lat.toFixed(4)}°, {metadata.user_location.lon.toFixed(4)}°</div>
        </div>
      )}
    </div>
  );
}
