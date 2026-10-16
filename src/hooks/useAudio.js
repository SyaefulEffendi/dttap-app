/**
 * useSpeech - Hook untuk Web Speech API (TTS)
 * Dioptimalkan untuk kompatibilitas browser (Chromium, Safari, Mobile).
 * Mengatasi bug cancel-drop, garbage collection V8, dan audio unlock.
 */
import { useCallback, useRef, useEffect } from 'react';

// Cache daftar voice secara global
let cachedVoices = [];
function updateVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export function useSpeech() {
  const timeoutRef = useRef(null);

  useEffect(() => {
    updateVoices();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const speak = useCallback((text, { rate = 0.88, pitch = 1.05, volume = 1 } = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Bersihkan timer pending jika ada
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Pastikan status paused ter-resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Hentikan suara yang sedang berbunyi
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }

    // Jeda 60ms setelah cancel() agar Chromium menyelesaikan cancellation queue
    // dan tidak membatalkan utterance baru yang hendak diputar
    timeoutRef.current = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        // Ambil daftar suara terkini
        if (!cachedVoices.length) {
          updateVoices();
        }

        // Cari suara Bahasa Indonesia
        const idVoice = cachedVoices.find(v =>
          v.lang.toLowerCase().startsWith('id') ||
          v.lang.toLowerCase().includes('indonesia') ||
          v.name.toLowerCase().includes('indonesia')
        );

        if (idVoice) {
          utterance.voice = idVoice;
        }

        // PENTING: Simpan ke window agar V8 Garbage Collector tidak menghapus objek di memori
        window.__activeUtterance = utterance;

        utterance.onend = () => {
          if (window.__activeUtterance === utterance) {
            window.__activeUtterance = null;
          }
        };

        utterance.onerror = (e) => {
          // Abaikan error 'canceled' dan 'interrupted' karena normal saat user mengklik cepat
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('SpeechSynthesis error:', e.error);
          }
          if (window.__activeUtterance === utterance) {
            window.__activeUtterance = null;
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Gagal memutar suara instruksi:', err);
      }
    }, 60);
  }, []);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }, []);

  return { speak, stop };
}

/**
 * useSound - Hook untuk sound effects sederhana menggunakan Web Audio API
 */
export function useSound() {
  const audioCtxRef = useRef(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  /** Suara tepuk tangan - benar */
  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      // Buat suara "ding" ceria
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch (e) {
      // Audio tidak tersedia, abaikan
    }
  }, []);

  /** Suara buzzer - salah */
  const playWrong = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio tidak tersedia, abaikan
    }
  }, []);

  /** Suara klik kartu */
  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }, []);

  /** Suara transisi ronde */
  const playRoundComplete = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.35);
      });
    } catch (e) {}
  }, []);

  return { playCorrect, playWrong, playClick, playRoundComplete };
}
