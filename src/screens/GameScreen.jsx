import { useState, useEffect, useCallback, useRef } from 'react';
import { buildRounds, getCardImageUrl, shuffleArray } from '../data/categories';
import { useSpeech, useSound } from '../hooks/useAudio';
import './GameScreen.css';

const TOTAL_ROUNDS = 5;
const CLICKS_TO_PASS = 3;     // klik target benar per sub-tahap
const MOVE_DELAY = 700;       // ms setelah klik benar sebelum kartu pindah
const INTRO_DELAY = 800;      // ms sebelum instruksi pertama diucapkan
const SPEECH_DELAY = 400;     // ms setelah kartu muncul sebelum TTS

/** Hitung ukuran kartu proporsional dengan area bermain agar pas di iPad, tablet, dan HP */
function getCardSize(areaW, areaH) {
  // Batasi ukuran maksimal 180px dan minimal 100px
  const byWidth = areaW / 3.4;
  const byHeight = areaH * 0.44;
  const size = Math.floor(Math.min(180, Math.min(byWidth, byHeight)));
  return Math.max(105, size);
}

/** Posisi acak dalam area bermain (menghindari tepi layar) */
function randomPosition(areaW, areaH, cardSize) {
  const marginX = Math.max(12, Math.min(26, areaW * 0.03));
  const marginY = Math.max(12, Math.min(26, areaH * 0.04));
  const maxX = Math.max(0, areaW - cardSize - marginX * 2);
  const maxY = Math.max(0, areaH - cardSize - marginY * 2);
  const x = marginX + Math.random() * maxX;
  const y = marginY + Math.random() * maxY;
  return { x, y };
}

/** Generate posisi tidak bertabrakan untuk beberapa kartu */
function generatePositions(count, areaW, areaH, cardSize) {
  const positions = [];
  const attempts = 150;
  const minDistance = cardSize * 0.95;

  for (let i = 0; i < count; i++) {
    let bestPos = null;
    let maxDistToExisting = -1;

    for (let tryIdx = 0; tryIdx < attempts; tryIdx++) {
      const pos = randomPosition(areaW, areaH, cardSize);
      let collision = false;
      let closestDist = Infinity;

      for (const p of positions) {
        const dx = Math.abs(p.x - pos.x);
        const dy = Math.abs(p.y - pos.y);
        const dist = Math.hypot(dx, dy);
        if (dist < closestDist) {
          closestDist = dist;
        }
        if (dx < minDistance && dy < minDistance) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        bestPos = pos;
        break;
      }

      if (closestDist > maxDistToExisting) {
        maxDistToExisting = closestDist;
        bestPos = pos;
      }
    }

    positions.push(bestPos || randomPosition(areaW, areaH, cardSize));
  }
  return positions;
}

export default function GameScreen({ category, onFinish, onBack }) {
  const [rounds] = useState(() => buildRounds(category.cards, TOTAL_ROUNDS, 3));
  const [roundIdx, setRoundIdx] = useState(0);         // 0..9
  const [phase, setPhase] = useState(0);                // 0=kartu1 solo, 1=kartu2+decoy1, 2=kartu3+decoy1+2
  const [subPhase, setSubPhase] = useState('solo');     // 'solo'|'withDecoys'
  const [targetClicks, setTargetClicks] = useState(0);  // berapa kali klik benar di sub-fase ini
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [cards, setCards] = useState([]);               // { card, x, y, anim }
  const [feedback, setFeedback] = useState(null);       // 'correct'|'wrong'|null
  const [clickedCardId, setClickedCardId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const areaRef = useRef(null);
  const { speak, stop } = useSpeech();
  const { playCorrect, playWrong, playRoundComplete } = useSound();

  const getArea = () => {
    if (areaRef.current) {
      return { w: areaRef.current.offsetWidth, h: areaRef.current.offsetHeight };
    }
    return { w: 800, h: 500 };
  };

  /** Dapatkan kartu target saat ini */
  const getCurrentTarget = useCallback(() => {
    const round = rounds[roundIdx];
    if (!round) return null;
    return round[phase]; // phase 0,1,2 → kartu 1,2,3
  }, [rounds, roundIdx, phase]);

  const instructionTimerRef = useRef(null);

  /** Ucapkan instruksi suara */
  const sayInstruction = useCallback((targetCard, immediate = false) => {
    const tgt = targetCard || getCurrentTarget();
    if (!tgt || !tgt.name) return;

    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current);
      instructionTimerRef.current = null;
    }

    const runSpeech = () => {
      speak(`Klik ${tgt.name}!`);
    };

    if (immediate) {
      runSpeech();
    } else {
      instructionTimerRef.current = setTimeout(runSpeech, SPEECH_DELAY);
    }
  }, [speak, getCurrentTarget]);

  /** Render kartu di posisi baru */
  const placeCards = useCallback((cardsToShow, target) => {
    const { w, h } = getArea();
    const size = getCardSize(w, h);
    const positions = generatePositions(cardsToShow.length, w, h, size);
    const newCards = cardsToShow.map((card, i) => ({
      card,
      x: positions[i].x,
      y: positions[i].y,
      size,
      anim: 'enter',
    }));
    setCards(newCards);
    sayInstruction(target);
  }, [sayInstruction]);

  /** Pindahkan posisi kartu secara acak */
  const shufflePositions = useCallback(() => {
    const { w, h } = getArea();
    const size = getCardSize(w, h);
    const positions = generatePositions(cards.length, w, h, size);
    setCards(prev => prev.map((c, i) => ({
      ...c,
      x: positions[i].x,
      y: positions[i].y,
      size,
      anim: 'move',
    })));
  }, [cards.length]);

  // Tangani rotasi layar / resize pada tablet dan iPad
  useEffect(() => {
    const handleResize = () => {
      if (cards.length > 0 && !isTransitioning) {
        shufflePositions();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cards.length, isTransitioning, shufflePositions]);

  // ===== Setup ronde baru =====
  const startRound = useCallback((rIdx) => {
    setShowRoundBanner(true);
    setIsTransitioning(true);
    setTimeout(() => {
      setShowRoundBanner(false);
      setPhase(0);
      setSubPhase('solo');
      setTargetClicks(0);
      const round = rounds[rIdx];
      const target = round[0];
      setTimeout(() => {
        placeCards([target], target);
        setIsTransitioning(false);
      }, 300);
    }, 1400);
  }, [rounds, placeCards]);

  // Init game
  useEffect(() => {
    startRound(0);
    return () => {
      stop();
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Handle klik kartu =====
  const handleCardClick = useCallback((clickedCard) => {
    if (isTransitioning || feedback) return;

    const target = getCurrentTarget();
    if (!target) return;

    const isCorrect = clickedCard.id === target.id;
    setClickedCardId(clickedCard.id);

    if (isCorrect) {
      playCorrect();
      setFeedback('correct');
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));

      const newClicks = targetClicks + 1;
      setTargetClicks(newClicks);

      setTimeout(() => {
        setFeedback(null);
        setClickedCardId(null);

        if (newClicks >= CLICKS_TO_PASS) {
          // Sub-fase selesai → lanjut ke tahap berikutnya
          advancePhase(newClicks);
        } else {
          // Belum 3 klik → acak posisi, ulangi instruksi
          shufflePositions();
          sayInstruction(target);
        }
      }, MOVE_DELAY);

    } else {
      playWrong();
      setFeedback('wrong');
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));

      setTimeout(() => {
        setFeedback(null);
        setClickedCardId(null);
        shufflePositions();
        sayInstruction(target);
      }, MOVE_DELAY);
    }
  }, [isTransitioning, feedback, getCurrentTarget, targetClicks, playCorrect, playWrong, shufflePositions, sayInstruction]);

  /** Maju ke tahap/sub-tahap berikutnya sesuai logika DTT */
  const advancePhase = useCallback((clicks) => {
    const round = rounds[roundIdx];
    setIsTransitioning(true);

    // Semua kartu hilang sebentar
    setCards([]);
    stop();
    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current);
      instructionTimerRef.current = null;
    }

    setTimeout(() => {
      if (subPhase === 'solo') {
        // Kartu solo → muncul pengecoh
        if (phase === 0) {
          // Tahap 2: kartu 2 solo
          setPhase(1);
          setSubPhase('solo');
          setTargetClicks(0);
          const target = round[1];
          placeCards([target], target);
        } else if (phase === 1) {
          // Sudah kartu 2 solo → kartu 2 + pengecoh kartu 1
          setSubPhase('withDecoys');
          setTargetClicks(0);
          const target = round[1];
          placeCards(shuffleArray([round[0], target]), target);
        } else if (phase === 2) {
          // Kartu 3 solo → kartu 3 + pengecoh 1 & 2
          setSubPhase('withDecoys');
          setTargetClicks(0);
          const target = round[2];
          placeCards(shuffleArray([round[0], round[1], target]), target);
        }
        setIsTransitioning(false);

      } else {
        // subPhase === 'withDecoys'
        if (phase === 1) {
          // Tahap 3: kartu 3 solo
          setPhase(2);
          setSubPhase('solo');
          setTargetClicks(0);
          const target = round[2];
          placeCards([target], target);
          setIsTransitioning(false);
        } else if (phase === 2) {
          // Ronde selesai!
          playRoundComplete();
          const nextRound = roundIdx + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            // GAME SELESAI
            setIsTransitioning(false);
            setTimeout(() => setGameOver(true), 500);
          } else {
            setRoundIdx(nextRound);
            setIsTransitioning(false);
            startRound(nextRound);
          }
        }
      }
    }, 600);
  }, [rounds, roundIdx, phase, subPhase, placeCards, playRoundComplete, startRound, stop]);

  if (gameOver) {
    onFinish(score);
    return null;
  }

  const target = getCurrentTarget();
  const totalClicks = (roundIdx * 18) + (phase * 6) + (subPhase === 'withDecoys' ? 3 : 0) + targetClicks;
  const maxClicks = TOTAL_ROUNDS * 18;
  const progressPct = Math.min(100, (totalClicks / maxClicks) * 100);

  return (
    <div className="game-screen">
      {/* ---- Top HUD ---- */}
      <div className="game-hud" style={{ borderColor: category.color }}>
        <button id="btn-exit-game" className="btn btn-accent btn-sm hud-exit" onClick={onBack}>
          ✕ Keluar
        </button>

        <div className="hud-center">
          <div className="hud-category" style={{ color: category.color }}>
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </div>
          <div className="progress-bar-wrap hud-progress">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="hud-info">
            Ronde <strong>{roundIdx + 1}</strong> / {TOTAL_ROUNDS}
            &nbsp;·&nbsp;
            Tahap <strong>{phase + 1}</strong>/3
            {subPhase === 'withDecoys' && <span className="hud-decoy-badge"> + Pengecoh</span>}
          </div>
        </div>

        <div className="hud-score">
          <span className="score-correct">✅ {score.correct}</span>
          <span className="score-wrong">❌ {score.wrong}</span>
        </div>
      </div>

      {/* ---- Instruction Bar ---- */}
      {target && !isTransitioning && (
        <div className="instruction-bar" style={{ background: category.bgGradient }}>
          <div className="instruction-content">
            <button
              id="btn-repeat-audio"
              className="instruction-speaker"
              onClick={() => sayInstruction(target, true)}
              title="Ulangi instruksi"
            >
              🔊
            </button>
            <span className="instruction-text">
              Klik <strong>{target.name}!</strong>
            </span>
          </div>
        </div>
      )}

      {/* ---- Game Area ---- */}
      <div className="game-area" ref={areaRef}>
        {cards.map(({ card, x, y, size, anim }) => {
          const cardDim = size || 160;
          return (
            <div
              key={card.id}
              id={`card-${card.id}`}
              className={[
                'game-card',
                anim,
                clickedCardId === card.id && feedback === 'correct' ? 'card-correct' : '',
                clickedCardId === card.id && feedback === 'wrong' ? 'card-wrong' : '',
              ].join(' ')}
              style={{
                left: x,
                top: y,
                width: cardDim,
                height: cardDim,
                transition: anim === 'move'
                  ? 'left 0.55s cubic-bezier(0.34,1.56,0.64,1), top 0.55s cubic-bezier(0.34,1.56,0.64,1)'
                  : undefined,
                borderColor: category.color + '55',
              }}
              onClick={() => handleCardClick(card)}
            >
              <img
                src={getCardImageUrl(category.folder, card.file)}
                alt={card.name}
                draggable={false}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          );
        })}

        {/* Progress klik target */}
        {!isTransitioning && targetClicks > 0 && (
          <div className="click-progress">
            {Array.from({ length: CLICKS_TO_PASS }).map((_, i) => (
              <div
                key={i}
                className={`click-dot ${i < targetClicks ? 'filled' : ''}`}
                style={{ background: i < targetClicks ? category.color : undefined }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Feedback Flash ---- */}
      {feedback && (
        <div className={`feedback-flash ${feedback}`} />
      )}

      {/* ---- Feedback emoji overlay ---- */}
      {feedback === 'correct' && (
        <div className="feedback-emoji correct-emoji">⭐</div>
      )}
      {feedback === 'wrong' && (
        <div className="feedback-emoji wrong-emoji">💨</div>
      )}

      {/* ---- Round Banner ---- */}
      {showRoundBanner && (
        <div className="round-banner-overlay">
          <div className="round-banner" style={{ background: category.bgGradient }}>
            <span className="round-banner-num">Ronde {roundIdx + 1}</span>
            <span className="round-banner-sub">{category.icon} {category.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
