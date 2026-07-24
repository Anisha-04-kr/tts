"use client";

import React, { useState, useRef } from "react";
import { Volume2, Play, Pause, Square, Download, Sliders, Sparkles, Globe, Smile, Music } from "lucide-react";

export default function TTSPage() {
  const [text, setText] = useState("Patient is prescribed Amoxicillin 500mg capsules, to be taken three times daily with food for a duration of 7 days.");
  const [voice, setVoice] = useState("Fish Speech Dr. Clara (Female)");
  const [languageCode, setLanguageCode] = useState("en");
  const [emotion, setEmotion] = useState("Professional / Neutral");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = [
    { code: "en", name: "English (US Clinical)" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "zh", name: "Mandarin (中文)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "ko", name: "Korean (한국어)" },
    { code: "ta", name: "Tamil (தமிழ்)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "ar", name: "Arabic (العربية)" },
    { code: "ru", name: "Russian (Русский)" },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/v1/tts/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          language: languageCode,
          speaker: voice,
          speed: speed,
          pitch: pitch,
          sample_rate: 24000,
          output_format: "wav"
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let url = "";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (data.audio_base64) {
            url = `data:audio/wav;base64,${data.audio_base64}`;
          }
        } else {
          const blob = await response.blob();
          setAudioBlob(blob);
          url = URL.createObjectURL(blob);
        }

        if (url) {
          setAudioUrl(url);
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.volume = volume / 100;
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.error("Playback error:", err));
          }
        }
      } else {
        alert("Failed to synthesize audio in selected language. Server returned non-200 status.");
      }
    } catch (err) {
      console.error("TTS Synthesis error:", err);
      alert("Error connecting to local backend TTS API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleDownload = (format: "wav" | "mp3") => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `synthesized_speech_${languageCode}_${Date.now()}.${format}`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hidden HTML5 Audio player element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Multilingual Text-to-Speech Voice Synthesis
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono">
                Fish Speech S2 Pro Multilingual
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">TTS Model Pipeline: Input Clinical Text → Phoneme Tokenizer → Fish Speech S2 Pro Vocoder → 24kHz Neural Audio Waveform</p>

          </div>
        </div>

        {audioUrl && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload("wav")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold transition flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>WAV</span>
            </button>
            <button
              onClick={() => handleDownload("mp3")}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold transition flex items-center space-x-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MP3</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Text Editor & Audio Waveform Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" /> Clinical Text Input Editor
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste medical notes, clinical summaries, or patient prescription instructions in your desired target language script..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Audio Waveform Preview & Controls */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Audio Synthesis Engine:</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold uppercase">
                {languageCode} Language Target
              </span>
            </div>

            {/* Waveform Bars */}
            <div className="flex items-center justify-between space-x-1 h-12 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {[30, 60, 45, 90, 75, 40, 85, 95, 60, 30, 80, 50, 70, 40, 90, 65, 35, 80, 50, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying ? "bg-purple-600 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Playback Button Group */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  disabled={!audioUrl}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? "Pause" : "Play Synthesized Audio"}</span>
                </button>
                <button
                  onClick={stopPlay}
                  disabled={!audioUrl}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition"
                >
                  <Square className="w-3.5 h-3.5 fill-slate-700 dark:fill-slate-300" />
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md"
              >
                {isGenerating ? "Synthesizing Speech..." : "Generate Multilingual Speech"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Language & Voice Parameter Tuning */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-purple-500" /> Language & Voice Controls
          </h2>

          {/* Language Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-500" /> Target Speech Language
            </label>
            <select
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-purple-500"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Model Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-purple-500" /> Voice Profile
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Fish Speech Dr. Clara (Female)">Fish Speech Dr. Clara (Female)</option>
              <option value="Fish Speech Dr. Marcus (Male)">Fish Speech Dr. Marcus (Male)</option>
              <option value="Indic TTS Regional Assistant">Indic TTS Regional Assistant</option>
            </select>
          </div>

          {/* Emotion Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-500" /> Tone & Emotion
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Professional / Neutral">Professional / Neutral</option>
              <option value="Calm & Reassuring">Calm & Reassuring</option>
              <option value="Clear & Authoritative">Clear & Authoritative</option>
            </select>
          </div>

          {/* Sliders: Speed, Pitch, Volume */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>Speed:</span>
                <span className="font-mono font-bold text-purple-500">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>Pitch:</span>
                <span className="font-mono font-bold text-purple-500">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>Volume:</span>
                <span className="font-mono font-bold text-purple-500">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
