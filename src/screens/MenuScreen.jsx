import { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import './MenuScreen.css';

export default function MenuScreen({ onSelectCategory, onBack }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="menu-screen">
      {/* Header */}
      <header className="menu-header">
        <button id="btn-back-home" className="btn btn-accent btn-sm" onClick={onBack}>
          ← Kembali
        </button>
        <div className="menu-header-title">
          <span className="menu-title-icon">🎮</span>
          <h1>Pilih Kategori</h1>
        </div>
        <div className="menu-header-spacer" />
      </header>

      {/* Subtitle */}
      <p className="menu-subtitle">
        Pilih satu kategori untuk mulai belajar bersama! 🌟
      </p>

      {/* Grid Kategori */}
      <div className="category-grid">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            id={`cat-${cat.id}`}
            className={`category-card ${hoveredId === cat.id ? 'hovered' : ''}`}
            style={{
              '--cat-color': cat.color,
              '--cat-gradient': cat.bgGradient,
              animationDelay: `${i * 0.07}s`,
            }}
            onClick={() => onSelectCategory(cat)}
            onMouseEnter={() => setHoveredId(cat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="category-card-inner">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
              <span className="category-count">{cat.cards.length} kartu</span>
            </div>
            <div className="category-card-glow" />
          </button>
        ))}
      </div>
    </div>
  );
}
