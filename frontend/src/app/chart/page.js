'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassPanel from '@/components/GlassPanel';
import BirthDataForm from '@/components/BirthDataForm';
import NorthIndianChart from '@/components/NorthIndianChart';
import ChartControls from '@/components/ChartControls';
import AstrologerChat from '@/components/AstrologerChat';
import { fetchChart, fetchChartPdf } from '@/lib/api';
import { calculateAspects } from '@/lib/aspects';

export default function ChartPage() {
  const router = useRouter();
  const [chartData, setChartData] = useState(null);
  const [aspectData, setAspectData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showAspects, setShowAspects] = useState(true);
  const [lastRequest, setLastRequest] = useState(null);
  const [errorMSG, setErrorMSG] = useState("");

  const handleGenerate = async (formData) => {
    setLoading(true);
    setErrorMSG("");
    try {
      const data = await fetchChart(formData);
      setChartData(data);
      setLastRequest(formData);

      const aspects = calculateAspects(data.planets, data.ascendant.sign_index);
      setAspectData(aspects);
    } catch (err) {
      console.error(err);
      setErrorMSG("Backend is not reachable or failed to compute the chart.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!lastRequest) return;
    setLoadingPdf(true);
    try {
      await fetchChartPdf(lastRequest);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '4px 0',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.color = '#FBBF24'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
            Astro K
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chart Generation Engine</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', flex: 1 }}>
        {/* Left Column: Form */}
        <div style={{ flex: '1 1 350px', maxWidth: '400px' }}>
          <GlassPanel>
            <BirthDataForm onSubmit={handleGenerate} loading={loading} />
            
            {errorMSG && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,50,50,0.1)', color: '#ff8a8a', borderRadius: '8px', fontSize: '0.85rem' }}>
                {errorMSG}
              </div>
            )}
          </GlassPanel>

          {!chartData && (
            <div className="fade-in" style={{ marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p>Your data remains completely ephemeral:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '12px', listStyleType: 'circle' }}>
                <li>No database reads or writes</li>
                <li>No file storage on disk</li>
                <li>Processed entirely in RAM</li>
                <li>Uses accurate Swiss Ephemeris</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Chart */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column' }}>
          <GlassPanel style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {chartData ? (
              <div className="fade-in">
                <NorthIndianChart 
                  chartData={chartData} 
                  showAspects={showAspects} 
                  aspects={aspectData} 
                />
                <ChartControls 
                  showAspects={showAspects}
                  setShowAspects={setShowAspects}
                  onExportPdf={handleExportPdf}
                  loadingPdf={loadingPdf}
                  metadata={chartData.metadata}
                />
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', minHeight: '400px' }}>
                {loading ? (
                  <div className="animate-pulse" style={{ color: 'var(--neon-green)' }}>Aligning celestial bodies...</div>
                ) : (
                  <div>Enter birth details to generate the chart</div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* AI Astrologer Chat — floating button after chart generation */}
      {chartData && <AstrologerChat chartData={chartData} />}
    </div>
  );
}
