'use client';

import { useState, useEffect, useRef } from 'react';

export default function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
          headers: {
            // Required by OpenStreetMap's usage policy
            'User-Agent': 'AstroK/1.0 (contact@example.com)'
          }
        });
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setOpen(false);
    onLocationSelect({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      displayName: place.display_name
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        placeholder="Enter city, country..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // If they clear it, remove selection
          if (!e.target.value) onLocationSelect(null);
        }}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
      />
      {loading && (
        <span style={{ position: 'absolute', right: 10, top: 12, color: 'var(--text-secondary)' }}>
          ...
        </span>
      )}
      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-deep)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          marginTop: '4px',
          padding: '8px 0',
          listStyle: 'none',
          zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {results.map((r, i) => (
            <li 
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--glass-border)' : 'none',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
