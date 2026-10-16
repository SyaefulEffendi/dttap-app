import { useState, useEffect } from 'react';
import './HomeScreen.css';

const RULES = [
  { icon: '1️⃣', text: 'Pilih kategori yang ingin dipelajari.' },
  { icon: '2️⃣', text: 'Perhatikan gambar yang muncul di layar.' },
  { icon: '3️⃣', text: 'Dengarkan instruksi dari aplikasi.' },
  { icon: '4️⃣', text: 'Pilih gambar sesuai instruksi yang diberikan.' },
  { icon: '5️⃣', text: 'Perhatikan umpan balik atas jawaban yang dipilih.' },
  { icon: '6️⃣', text: 'Ulangi latihan sesuai target.' },
  { icon: '7️⃣', text: 'Lihat hasil latihan untuk mengetahui perkembangan anak.' },
];

export default function HomeScreen({ onStart }) {
  const [showRules, setShowRules] = useState(false);
  const [titleAnim, setTitleAnim] = useState(false);

  useEffect(() => {
    setTimeout(() => setTitleAnim(true), 100);
    // Inisialisasi audio & voices saat pertama dibuka
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
  }, []);

  return (
    <div className="home-screen">
      {/* Dekorasi latar */}
      <div className="home-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
        <div className="shape shape-5" />
      </div>

      {/* Awan dekoratif */}
      <div className="clouds">
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">☁️</div>
      </div>

      {/* Konten utama */}
      <div className={`home-content ${titleAnim ? 'home-content--visible' : ''}`}>
        {/* Logo & Judul */}
        <div className="home-logo">
          <div className="home-logo-icon">🎮</div>
          <h1 className="home-title">
            <span className="title-dt">DT</span>
            <span className="title-tap">Tap!</span>
          </h1>
          <p className="home-subtitle">Belajar Sambil Bermain</p>
          <p className="home-tagline">
            Permainan edukatif untuk terapi wicara anak
          </p>
        </div>

        {/* Kartu preview animasi */}
        <div className="home-cards-preview">
          <div className="preview-card preview-card-1">🍎</div>
          <div className="preview-card preview-card-2">🐱</div>
          <div className="preview-card preview-card-3">👋</div>
          <div className="preview-card preview-card-4">🦁</div>
          <div className="preview-card preview-card-5">🍽️</div>
        </div>

        {/* Tombol aksi */}
        <div className="home-actions">
          <button
            id="btn-start"
            className="btn btn-primary btn-lg home-btn-start"
            onClick={onStart}
          >
            <span>▶</span> Mulai Bermain!
          </button>
          <button
            id="btn-rules"
            className="btn btn-secondary home-btn-rules"
            onClick={() => setShowRules(true)}
          >
            <span>📋</span> Cara Penggunaan
          </button>
        </div>

        {/* Badge info */}
        <div className="home-badges">
          <span className="badge">9 Kategori</span>
          <span className="badge">10 Ronde/Sesi</span>
          <span className="badge">Metode DTT</span>
        </div>
      </div>

      {/* Popup Rules */}
      {showRules && (
        <div className="overlay" onClick={() => setShowRules(false)}>
          <div className="popup rules-popup" onClick={e => e.stopPropagation()}>
            <div className="rules-header">
              <span className="rules-icon">📋</span>
              <h2>Cara Penggunaan Aplikasi DTTap!</h2>
            </div>
            <ul className="rules-list">
              {RULES.map((rule, i) => (
                <li key={i} className="rule-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="rule-icon">{rule.icon}</span>
                  <span className="rule-text">{rule.text}</span>
                </li>
              ))}
            </ul>
            <div className="rules-note">
              <strong>Untuk Pendamping:</strong> Pastikan anak mengerti instruksi sebelum memulai.
              Berikan semangat di setiap jawaban yang benar! 🌟
            </div>
            <button
              id="btn-close-rules"
              className="btn btn-primary"
              onClick={() => setShowRules(false)}
            >
              Mengerti! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
