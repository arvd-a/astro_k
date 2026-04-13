'use client';

import { useState } from 'react';
import GlassPanel from '@/components/GlassPanel';
import BirthDataForm from '@/components/BirthDataForm';
import NorthIndianChart from '@/components/NorthIndianChart';
import ChartControls from '@/components/ChartControls';
import { fetchChart, fetchChartPdf } from '@/lib/api';
import { calculateAspects } from '@/lib/aspects';
import AstrologerChat from '@/components/AstrologerChat';

// Define the reference test fixture for development testing
const REFERENCE_FIXTURE = {
  date: "1990-01-15",
  time: "05:30",
  lat: 8.5241,
  lon: 76.9366,
  displayName: 'Trivandrum, India'
};

export default function Home() {
  const [chartData, setChartData] = useState(null);
  const [aspectData, setAspectData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showAspects, setShowAspects] = useState(true);
  
  // Store the last request perfectly so we can re-request PDF exactly
  const [lastRequest, setLastRequest] = useState(null);
  const [errorMSG, setErrorMSG] = useState("");

  const handleGenerate = async (formData) => {
    setLoading(true);
    setErrorMSG("");
    try {
      let data;
      if (process.env.NODE_ENV === 'development' && formData.date === '1990-01-15') {
        // Mock Reference Fixture Response (Trivandrum 1990-01-15 05:30)
        data = {
          metadata: {
            calculation_engine: 'pyswisseph (mock)',
            ayanamsa: 'Lahiri',
            julian_day: 2447906.5,
            user_location: { lat: 8.5241, lon: 76.9366, tz: 'Asia/Kolkata' }
          },
          ascendant: {
            absolute_degree: 254.5,
            sign_index: 8, // Sagittarius (Ascendant)
            sign_name: 'Sagittarius',
            sign_degree: 14.5
          },
          houses: Array.from({length: 12}).map((_, i) => ({
            house_number: i + 1,
            sign_index: (8 + i) % 12,
            sign_name: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][(8 + i) % 12]
          })),
          planets: [
            { id: 'su', name: 'Sun', absolute_degree: 270.5, sign_index: 9, sign_name: 'Capricorn', sign_degree: 0.5, nakshatra_index: 21, nakshatra_pada: 1, is_retrograde: false },
            { id: 'mo', name: 'Moon', absolute_degree: 140.2, sign_index: 4, sign_name: 'Leo', sign_degree: 20.2, nakshatra_index: 10, nakshatra_pada: 3, is_retrograde: false },
            { id: 'ma', name: 'Mars', absolute_degree: 230.1, sign_index: 7, sign_name: 'Scorpio', sign_degree: 20.1, nakshatra_index: 18, nakshatra_pada: 2, is_retrograde: false },
            { id: 'me', name: 'Mercury', absolute_degree: 285.3, sign_index: 9, sign_name: 'Capricorn', sign_degree: 15.3, nakshatra_index: 22, nakshatra_pada: 1, is_retrograde: false },
            { id: 'ju', name: 'Jupiter', absolute_degree: 65.4, sign_index: 2, sign_name: 'Gemini', sign_degree: 5.4, nakshatra_index: 5, nakshatra_pada: 4, is_retrograde: true },
            { id: 've', name: 'Venus', absolute_degree: 280.2, sign_index: 9, sign_name: 'Capricorn', sign_degree: 10.2, nakshatra_index: 21, nakshatra_pada: 2, is_retrograde: true },
            { id: 'sa', name: 'Saturn', absolute_degree: 260.6, sign_index: 8, sign_name: 'Sagittarius', sign_degree: 20.6, nakshatra_index: 20, nakshatra_pada: 2, is_retrograde: false },
            { id: 'ra', name: 'Rahu', absolute_degree: 295.1, sign_index: 9, sign_name: 'Capricorn', sign_degree: 25.1, nakshatra_index: 23, nakshatra_pada: 2, is_retrograde: true },
            { id: 'ke', name: 'Ketu', absolute_degree: 115.1, sign_index: 3, sign_name: 'Cancer', sign_degree: 25.1, nakshatra_index: 9, nakshatra_pada: 4, is_retrograde: true },
          ]
        };
        // Simulated network delay
        await new Promise(r => setTimeout(r, 800));
      } else {
        data = await fetchChart(formData);
      }
      setChartData(data);
      setLastRequest(formData);

      // Compute visual aspects dynamically locally based on sign placements
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

  // Development helper
  const loadFixture = () => handleGenerate(REFERENCE_FIXTURE);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>Astro K</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Privacy-first ephemeral Vedic chart engine.</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', flex: 1 }}>
        {/* Left Column: Form */}
        <div style={{ flex: '1 1 350px', maxWidth: '400px' }}>
          <GlassPanel>
            <BirthDataForm onSubmit={handleGenerate} loading={loading} />
            
            {/* Quick action for QA/Testing */}
            {process.env.NODE_ENV === 'development' && (
              <button onClick={loadFixture} className="btn" style={{ marginTop: '16px', width: '100%', fontSize: '0.8rem', opacity: 0.5 }}>
                Load Trivandrum 1990 Fixture
              </button>
            )}
            
            {errorMSG && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,50,50,0.1)', color: '#ff8a8a', borderRadius: '8px', fontSize: '0.85rem' }}>
                {errorMSG}
              </div>
            )}
          </GlassPanel>

          {/* Quick Info text */}
          {!chartData && (
            <div className="fade-in" style={{ marginTop: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p>Welcome to Astro K. Your data remains completely ephemeral:</p>
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

      {/* AI Astrologer Chat — appears after chart generation */}
      {chartData && <AstrologerChat chartData={chartData} />}
    </div>
  );
}
