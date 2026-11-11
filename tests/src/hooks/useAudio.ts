// src/hooks/useAudio.ts
// Web-Audio-API click/error sounds + speechSynthesis TTS. No external audio
// files are loaded — all sounds are synthesised on the fly.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  errorSounds: boolean;
  ttsEnabled: boolean;
  ttsRate: number;
  ttsLang: string;
}

export function useAudio(settings: AudioSettings | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const ctx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  const beep = useCallback(
    (freq: number, duration = 0.08, type: OscillatorType = "sine") => {
      if (!settings?.enabled) return;
      const ac = ctx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = settings.volume * 0.3;
      osc.connect(gain);
      gain.connect(ac.destination);
      const now = ac.currentTime;
      osc.start(now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.stop(now + duration);
    },
    [settings, ctx],
  );

  const click = useCallback(() => beep(880, 0.04, "square"), [beep]);
  const operatorSound = useCallback(() => beep(660, 0.05, "triangle"), [beep]);
  const errorSound = useCallback(() => {
    if (!settings?.errorSounds) return;
    beep(180, 0.18, "sawtooth");
  }, [beep, settings]);
  const resultSound = useCallback(() => beep(523, 0.06, "sine"), [beep]);

  const speak = useCallback(
    (text: string) => {
      if (!settings?.ttsEnabled) return;
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = settings.ttsRate;
      u.volume = settings.volume;
      // Pick a matching voice if available.
      const v = voices.find((x) =>
        x.lang.toLowerCase().startsWith(settings.ttsLang.toLowerCase().slice(0, 2)),
      );
      if (v) u.voice = v;
      u.lang = settings.ttsLang;
      window.speechSynthesis.speak(u);
    },
    [settings, voices],
  );

  return { click, operatorSound, errorSound, resultSound, speak, voices };
}
