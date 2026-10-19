import { useState, useCallback, useEffect, useRef } from 'react';
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import './index.css';

// Halaman / screen yang tersedia
const SCREENS = {
  HOME: 'home',
  MENU: 'menu',
  GAME: 'game',
  RESULT: 'result',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const userMutedRef = useRef(false);
  const audioRef = useRef(null);

  // Inisialisasi Audio Backsound
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.28;

    // Coba play saat awal (berhasil di desktop jika autoplay diperbolehkan)
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Browser mobile memblokir autoplay sebelum user berinteraksi, ini normal
      setIsPlaying(false);
    });

    // Buka kunci dan putar musik otomatis begitu ada sentuhan/tap/klik pertama di mana saja di layar
    const unlockAudio = () => {
      if (audio.paused && !userMutedRef.current) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };

    const events = ['touchstart', 'touchend', 'click', 'pointerdown'];
    events.forEach(evt => window.addEventListener(evt, unlockAudio, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, unlockAudio));
    };
  }, []);

  // Kelola musik saat berpindah layar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (screen === SCREENS.HOME || screen === SCREENS.MENU) {
      if (!userMutedRef.current && audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [screen]);

  // Tombol toggle pengatur musik
  const toggleBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      userMutedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      userMutedRef.current = false;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isPlaying]);

  const goHome = useCallback(() => {
    setScreen(SCREENS.HOME);
    setSelectedCategory(null);
    setFinalScore(null);
    if (audioRef.current && !userMutedRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const goMenu = useCallback(() => {
    setScreen(SCREENS.MENU);
    setFinalScore(null);
    // User baru saja klik tombol "Mulai Bermain!", manfaatkan user gesture ini untuk langsung memutar musik
    if (audioRef.current && !userMutedRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
    setScreen(SCREENS.GAME);
  }, []);

  const handleGameFinish = useCallback((score) => {
    setFinalScore(score);
    setScreen(SCREENS.RESULT);
  }, []);

  const handleReplay = useCallback(() => {
    if (selectedCategory) {
      setFinalScore(null);
      setScreen(SCREENS.GAME);
    }
  }, [selectedCategory]);

  return (
    <div className="full">
      {/* Audio element DOM */}
      <audio
        ref={audioRef}
        src="/assets/audio/bgm.mp3"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Tombol Pengatur Backsound Musik (hanya di Home & Menu) */}
      {(screen === SCREENS.HOME || screen === SCREENS.MENU) && (
        <button
          id="btn-toggle-bgm"
          className={`bgm-toggle-btn ${isPlaying ? '' : 'muted'}`}
          onClick={toggleBgm}
          title={isPlaying ? 'Matikan Musik Latar' : 'Nyalakan Musik Latar'}
          aria-label={isPlaying ? 'Matikan Musik Latar' : 'Nyalakan Musik Latar'}
        >
          <span className="bgm-icon">{isPlaying ? '🎵' : '🔇'}</span>
          <span>{isPlaying ? 'Musik: Nyala' : 'Nyalakan Musik'}</span>
        </button>
      )}

      {screen === SCREENS.HOME && (
        <HomeScreen onStart={goMenu} />
      )}

      {screen === SCREENS.MENU && (
        <MenuScreen
          onSelectCategory={handleSelectCategory}
          onBack={goHome}
        />
      )}

      {screen === SCREENS.GAME && selectedCategory && (
        <GameScreen
          key={`${selectedCategory.id}-${Date.now()}`}
          category={selectedCategory}
          onFinish={handleGameFinish}
          onBack={goMenu}
        />
      )}

      {screen === SCREENS.RESULT && finalScore && selectedCategory && (
        <ResultScreen
          score={finalScore}
          category={selectedCategory}
          onBackToMenu={goMenu}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}

