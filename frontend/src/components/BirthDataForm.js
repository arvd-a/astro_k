'use client';

import { useState, useEffect } from 'react';
import LocationSearch from './LocationSearch';

export default function BirthDataForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    lat: null,
    lon: null,
    displayName: ''
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
      lon: formData.lon
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

      <button type="submit" className="btn btn-system" disabled={loading} style={{ marginTop: '16px', padding: '12px' }}>
        {loading ? 'Generating...' : 'Generate Chart'}
      </button>
    </form>
  );
}
