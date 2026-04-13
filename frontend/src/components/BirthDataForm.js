'use client';

import { useState, useEffect } from 'react';
import LocationSearch from './LocationSearch';

const AYANAMSA_OPTIONS = [
  { value: 'lahiri', label: 'Lahiri (Default)' },
  { value: 'raman', label: 'Raman' },
  { value: 'kp', label: 'Krishnamurti (KP)' },
  { value: 'true_chitrapaksha', label: 'True Chitrapaksha' },
];

export default function BirthDataForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    lat: null,
    lon: null,
    displayName: '',
    ayanamsa: 'lahiri',
    topocentric: false,
  });

  // Restore session data if available
  useEffect(() => {
    const saved = sessionStorage.getItem('astro_k_form');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lon || !formData.date || !formData.time) {
      alert("Please fill all fields and select a location from the dropdown.");
      return;
    }

    sessionStorage.setItem('astro_k_form', JSON.stringify(formData));
    onSubmit({
      date: formData.date,
      time: formData.time,
      lat: formData.lat,
      lon: formData.lon,
      ayanamsa: formData.ayanamsa,
      topocentric: formData.topocentric,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Enter Birth Details</h2>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
          <input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Time (24h)</label>
          <input 
            type="time" 
            value={formData.time}
            onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Location</label>
        <LocationSearch 
          onLocationSelect={(loc) => {
            if (loc) {
              setFormData(p => ({ ...p, lat: loc.lat, lon: loc.lon, displayName: loc.displayName }));
            } else {
              setFormData(p => ({ ...p, lat: null, lon: null, displayName: '' }));
            }
          }} 
        />
        {formData.displayName && (
          <div style={{ fontSize: '0.8rem', color: 'var(--neon-green)', marginTop: '8px' }}>
            Selected: {formData.displayName}
          </div>
        )}
      </div>

      {/* --- Advanced Settings --- */}
      <details style={{ marginTop: '4px' }}>
        <summary style={{
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: 'var(--gold)',
          userSelect: 'none',
          fontWeight: 500,
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            fontSize: '0.7rem',
          }}>▶</span>
          Advanced Settings
        </summary>

        <div style={{
          marginTop: '12px',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(251, 191, 36, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Ayanamsa Dropdown */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>
              Ayanamsa System
            </label>
            <select
              id="ayanamsa-select"
              value={formData.ayanamsa}
              onChange={(e) => setFormData(p => ({ ...p, ayanamsa: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {AYANAMSA_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e', color: '#f0f0f0' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Topocentric Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div>
              <label style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'block',
              }}>
                Topocentric Mode
              </label>
              <span style={{
                fontSize: '0.7rem',
                color: 'rgba(148, 163, 184, 0.6)',
              }}>
                Surface-level precision for Moon
              </span>
            </div>
            <button
              type="button"
              id="topocentric-toggle"
              onClick={() => setFormData(p => ({ ...p, topocentric: !p.topocentric }))}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
                flexShrink: 0,
                background: formData.topocentric
                  ? 'var(--neon-green)'
                  : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: formData.topocentric ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: formData.topocentric ? '#141419' : '#94A3B8',
                transition: 'left 0.2s ease, background 0.2s ease',
              }} />
            </button>
          </div>
        </div>
      </details>

      <button type="submit" className="btn btn-system" disabled={loading} style={{ marginTop: '16px', padding: '12px' }}>
        {loading ? 'Generating...' : 'Generate Chart'}
      </button>
    </form>
  );
}
