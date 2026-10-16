import { useEffect, useState } from 'react';
import './ResultScreen.css';

const TOTAL_ROUNDS = 10;
const MAX_CORRECT = TOTAL_ROUNDS * 9; // 9 klik benar per ronde (3 sub-tahap × 3 klik)

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#ff6b35','#4ecdc4','#ffe66d','#9b59b6','#ff6b9d','#2ecc71','#3498db'];
  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function StarRating({ score, max }) {
  const pct = score / max;
  let stars = 1;
  if (pct >= 0.9) stars = 5;
  else if (pct >= 0.75) stars = 4;
  else if (pct >= 0.55) stars = 3;
  else if (pct >= 0.35) stars = 2;
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`star ${i < stars ? 'star-filled' : 'star-empty'}`}
          style={{ animationDelay: `${0.3 + i * 0.15}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ResultScreen({ score, category, onBackToMenu, onReplay }) {
  const [visible, setVisible] = useState(false);
  const [countedCorrect, setCountedCorrect] = useState(0);
  const [countedWrong, setCountedWrong] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    // Animasi counter
    let frame = 0;
    const totalFrames = 60;
    const interval = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      setCountedCorrect(Math.round(score.correct * t));
      setCountedWrong(Math.round(score.wrong * t));
      if (frame >= totalFrames) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const pct = score.correct / (score.correct + score.wrong || 1);
  const isExcellent = pct >= 0.85;
  const isGood = pct >= 0.6;

  let message, emoji;
  if (isExcellent) {
    message = 'Luar Biasa! Kamu hebat sekali!';
    emoji = '🏆';
  } else if (isGood) {
    message = 'Bagus! Terus semangat berlatih!';
    emoji = '🌟';
  } else {
    message = 'Jangan menyerah! Coba lagi ya!';
    emoji = '💪';
  }

  return (
    <div className="result-screen">
      {isExcellent && <Confetti />}

      <div className={`result-content ${visible ? 'result-content--visible' : ''}`}>
        {/* Header */}
        <div className="result-header" style={{ background: category.bgGradient }}>
          <div className="result-emoji">{emoji}</div>
          <h1 className="result-title">Sesi Selesai!</h1>
          <p className="result-category">{category.icon} {category.label}</p>
        </div>

        {/* Star rating */}
        <StarRating score={score.correct} max={MAX_CORRECT} />

        {/* Pesan */}
        <p className="result-message">{message}</p>

        {/* Stats */}
        <div className="result-stats">
          <div className="stat-card stat-correct">
            <div className="stat-icon">✅</div>
            <div className="stat-num">{countedCorrect}</div>
            <div className="stat-label">Benar</div>
          </div>
          <div className="stat-card stat-wrong">
            <div className="stat-icon">❌</div>
            <div className="stat-num">{countedWrong}</div>
            <div className="stat-label">Salah</div>
          </div>
          <div className="stat-card stat-pct">
            <div className="stat-icon">📊</div>
            <div className="stat-num">{Math.round(pct * 100)}%</div>
            <div className="stat-label">Akurasi</div>
          </div>
          <div className="stat-card stat-rounds">
            <div className="stat-icon">🎯</div>
            <div className="stat-num">{TOTAL_ROUNDS}</div>
            <div className="stat-label">Ronde</div>
          </div>
        </div>

        {/* Aksi */}
        <div className="result-actions">
          <button
            id="btn-replay"
            className="btn btn-primary btn-lg"
            onClick={onReplay}
          >
            🔄 Main Lagi
          </button>
          <button
            id="btn-back-menu"
            className="btn btn-secondary"
            onClick={onBackToMenu}
          >
            🏠 Pilih Kategori
          </button>
        </div>
      </div>
    </div>
  );
}
