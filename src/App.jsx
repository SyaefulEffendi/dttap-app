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
  const [isBgmMuted, setIsBgmMuted] = useState(false);

  const bgmRef = useRef(null);

  const isBgmMutedRef = useRef(isBgmMuted);
  const screenRef = useRef(screen);

  useEffect(() => {
    isBgmMutedRef.current = isBgmMuted;
  }, [isBgmMuted]);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Inisialisasi Audio Backsound
  useEffect(() => {
    const audio = new Audio('/assets/audio/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.28;
    bgmRef.current = audio;

    const playIfAllowed = () => {
      const currentScreen = screenRef.current;
      const isMuted = isBgmMutedRef.current;
      if (audio && (currentScreen === SCREENS.HOME || currentScreen === SCREENS.MENU) && !isMuted) {
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            // Berhasil play! Hapus listener interaksi
            events.forEach(evt => window.removeEventListener(evt, playIfAllowed, true));
          }).catch(() => {
            // Masih terblokir kebijakan browser, tetap pasang listener untuk sentuhan berikutnya
          });
        }
      }
    };

    // Coba putar langsung saat pertama load (berhasil jika browser mengizinkan autoplay)
    playIfAllowed();

    // Buka kunci autoplay pada sentuhan/klik/tap pertama user di layar HP/tablet/laptop
    const events = ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'];
    events.forEach(evt => window.addEventListener(evt, playIfAllowed, true));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, playIfAllowed, true));
      audio.pause();
      bgmRef.current = null;
    };
  }, []);

  // Kelola pemutaran BGM berdasarkan layar aktif & status mute
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    if ((screen === SCREENS.HOME || screen === SCREENS.MENU) && !isBgmMuted) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [screen, isBgmMuted]);

  const toggleBgm = useCallback(() => {
    setIsBgmMuted(prev => {
      const next = !prev;
      if (bgmRef.current) {
        if (next) {
          bgmRef.current.pause();
        } else if (screen === SCREENS.HOME || screen === SCREENS.MENU) {
          bgmRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  }, [screen]);

  const goHome = useCallback(() => {
    setScreen(SCREENS.HOME);
    setSelectedCategory(null);
    setFinalScore(null);
    if (bgmRef.current && !isBgmMutedRef.current) {
      bgmRef.current.play().catch(() => {});
    }
  }, []);

  const goMenu = useCallback(() => {
    setScreen(SCREENS.MENU);
    setFinalScore(null);
    // User baru saja klik tombol "Mulai Bermain!", manfaatkan user gesture ini untuk langsung memutar musik
    if (bgmRef.current && !isBgmMutedRef.current) {
      bgmRef.current.play().catch(() => {});
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
      {/* Tombol Pengatur Backsound Musik (hanya di Home & Menu) */}
      {(screen === SCREENS.HOME || screen === SCREENS.MENU) && (
        <button
          id="btn-toggle-bgm"
          className={`bgm-toggle-btn ${isBgmMuted ? 'muted' : ''}`}
          onClick={toggleBgm}
          title={isBgmMuted ? 'Nyalakan Musik Latar' : 'Matikan Musik Latar'}
          aria-label={isBgmMuted ? 'Nyalakan Musik Latar' : 'Matikan Musik Latar'}
        >
          <span className="bgm-icon">{isBgmMuted ? '🔇' : '🎵'}</span>
          <span>{isBgmMuted ? 'Musik: Mati' : 'Musik: Nyala'}</span>
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

