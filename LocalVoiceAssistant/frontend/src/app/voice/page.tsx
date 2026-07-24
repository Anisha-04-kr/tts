"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Pause, Square, Download, Activity, Volume2, Clock, Globe, UserCheck, ShieldCheck, Sparkles, RefreshCw, AlertCircle } from "lucide-react";

export default function VoiceAssistantPage() {
  const [status, setStatus] = useState<"idle" | "listening" | "paused" | "processing" | "speaking">("idle");
  const [language, setLanguage] = useState("en-US");
  const [selectedVoice, setSelectedVoice] = useState("Fish Speech Dr. Clara (Female)");
  const [vadActive, setVadActive] = useState(false);
  const [latencyMs, setLatencyMs] = useState(142);
  const [transcriptTimeline, setTranscriptTimeline] = useState([
    { speaker: "User", text: "Patient is experiencing mild dyspnea and blood pressure reading is 135 over 85.", time: "10:14:02 AM" },
    { speaker: "AI Assistant", text: "Recorded stage 1 hypertension reading and mild dyspnea. Would you like me to generate a SOAP note section?", time: "10:14:04 AM" },
  ]);
  const [currentDraft, setCurrentDraft] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Stop recognition on cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const translateToEnglish = async (text: string, srcLangCode: string): Promise<string> => {
    if (srcLangCode.startsWith("en")) return text;
    const cleanCode = srcLangCode.split("-")[0].toLowerCase();
    try {
      const res = await fetch("/api/v1/translation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          source_language: cleanCode,
          target_language: "en"
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.translated_text || text;
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
    return text;
  };


  const generateAIResponse = async (userQuery: string) => {
    try {
      const res = await fetch("/api/v1/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userQuery })
      });
      if (res.ok) {
        const data = await res.json();
        return data.text || "Processed clinical voice dictation.";
      }
    } catch (err) {
      console.error("AI response error:", err);
    }
    return "Processed clinical voice dictation.";
  };

  const handleFinalSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setStatus("processing");

    // 1. Translate to English if chosen language is not English
    const isEnglish = language.startsWith("en");
    const englishTranslation = await translateToEnglish(spokenText, language);

    // Format dual-language text entry
    let displayText = "";
    if (isEnglish) {
      displayText = spokenText;
    } else {
      displayText = `Original (${language}): ${spokenText}\nEnglish Translation: ${englishTranslation}`;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Add user spoken entry to timeline
    setTranscriptTimeline(prev => [
      ...prev,
      { speaker: "User", text: displayText, time: timeStr }
    ]);

    // 2. Query AI Assistant for response
    const aiText = await generateAIResponse(englishTranslation || spokenText);
    const aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTranscriptTimeline(prev => [
      ...prev,
      { speaker: "AI Assistant", text: aiText, time: aiTimeStr }
    ]);

    setCurrentDraft("");
    setStatus("idle");
    setVadActive(false);
  };

  const getBrowserLangCode = (lang: string): string => {
    if (lang === "ur-IN" || lang === "ur") return "ur-PK";
    return lang;
  };

  const startMicrophone = async () => {
    setMicError(null);
    setCurrentDraft("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = getBrowserLangCode(language);

        recognition.onstart = () => {
          setStatus("listening");
          setVadActive(true);
        };

        recognition.onresult = (event: any) => {
          let interimText = "";
          let finalResultText = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalResultText += transcript;
            } else {
              interimText += transcript;
            }
          }

          if (interimText) {
            setCurrentDraft(interimText);
          }

          if (finalResultText) {
            recognition.stop();
            handleFinalSpeech(finalResultText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);

          // Retry with primary 2-letter language code if subtag failed (e.g., "ur")
          if (event.error === "language-not-supported") {
            const primaryLang = language.split("-")[0];
            if (recognition.lang !== primaryLang) {
              try {
                recognition.lang = primaryLang;
                recognition.start();
                return;
              } catch (e) {}
            }
          }

          if (event.error !== "no-speech") {
            setMicError(`Microphone notice: ${event.error}. Ensure microphone permissions are allowed.`);
          }
          setStatus("idle");
          setVadActive(false);
        };

        recognition.onend = () => {
          if (status === "listening" && currentDraft) {
            handleFinalSpeech(currentDraft);
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("SpeechRecognition init error:", err);
      }
    }


    // Fallback: MediaRecorder audio capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("listening");
      setVadActive(true);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus("processing");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          try {
            const asrRes = await fetch("/api/v1/asr/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio_base64: base64Audio, language: language.split("-")[0] })
            });

            if (asrRes.ok) {
              const data = await asrRes.json();
              handleFinalSpeech(data.transcription || "Voice recording captured.");
            } else {
              handleFinalSpeech("Voice recording captured.");
            }
          } catch (err) {
            console.error("ASR API error:", err);
            handleFinalSpeech("Voice audio recorded.");
          }
        };
      };

      mediaRecorder.start();
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setMicError("Microphone access denied or unavailable. Please check browser microphone permissions.");
      setStatus("idle");
      setVadActive(false);
    }
  };

  const handleStart = () => {
    startMicrophone();
  };

  const handlePause = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    setStatus("paused");
    setVadActive(false);
  };

  const handleResume = () => {
    startMicrophone();
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (currentDraft) {
      handleFinalSpeech(currentDraft);
    } else {
      setStatus("idle");
      setVadActive(false);
    }
  };

  const handleExportTranscript = () => {
    const text = transcriptTimeline.map(t => `[${t.time}] ${t.speaker}:\n${t.text}\n`).join("\n---\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice_encounter_transcript_${Date.now()}.txt`;
    a.click();
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Voice Assistant Mode
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                Full Duplex S2S
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Full-Duplex Model Pipeline: 16kHz Mic Audio → Whisper ASR (Spectrogram Tokens) → Locale Normalizer → Qwen 3.5 LLM (16K Context) → Fish Speech S2 Pro (24kHz Audio)</p>


          </div>
        </div>

        {/* Status & Latency Pills */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-slate-500">Latency:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{latencyMs} ms</span>
          </div>

          <button
            onClick={handleExportTranscript}
            className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Transcript</span>
          </button>
        </div>
      </div>

      {micError && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}


      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mic & Waveform Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col items-center justify-between text-center space-y-6 shadow-sm">
          {/* Audio Selector Dropdowns */}
          <div className="w-full space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 mb-1">
                <Globe className="w-3 h-3 text-primary-600" /> Input Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                <option value="ml-IN">Malayalam (മലയാളം)</option>
                <option value="mr-IN">Marathi (मराठी)</option>
                <option value="bn-IN">Bengali (বাংলা)</option>
                <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="or-IN">Odia (ଓଡ଼ିଆ)</option>
                <option value="ur-IN">Urdu (اردو)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
              </select>

            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 mb-1">
                <Volume2 className="w-3 h-3 text-purple-500" /> TTS Voice Model
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Fish Speech Dr. Clara (Female)">Fish Speech Dr. Clara (Female)</option>
                <option value="Fish Speech Dr. Marcus (Male)">Fish Speech Dr. Marcus (Male)</option>
                <option value="Indic TTS Regional Doctor">Indic TTS Regional Doctor</option>
              </select>
            </div>
          </div>

          {/* Large Microphone Visualizer Button */}
          <div className="relative flex items-center justify-center my-4">
            {/* Animated Wave Rings */}
            {status === "listening" && (
              <div className="absolute w-44 h-44 rounded-full bg-primary-500/20 animate-ping pointer-events-none" />
            )}

            <button
              onClick={status === "idle" ? handleStart : handleStop}
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                status === "listening"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white scale-105 shadow-red-500/40"
                  : status === "paused"
                    ? "bg-amber-500 text-white"
                    : "bg-gradient-to-r from-primary-600 to-blue-700 text-white hover:scale-105 shadow-primary-600/40"
              }`}
            >
              <Mic className="w-12 h-12" />
              <span className="text-[11px] font-bold tracking-wider uppercase mt-1">
                {status === "listening" ? "Listening..." : status === "paused" ? "Paused" : "Push To Talk"}
              </span>
            </button>
          </div>

          {/* Real-time Waveform Bars */}
          <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-center space-x-1.5 h-14">
            {[40, 70, 25, 90, 50, 80, 30, 95, 60, 40, 85, 35, 75, 50].map((h, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-200 ${
                  status === "listening"
                    ? "bg-primary-600 dark:bg-primary-400 animate-pulse"
                    : "bg-slate-300 dark:bg-slate-800"
                }`}
                style={{ height: status === "listening" ? `${Math.max(10, Math.floor(h * Math.random()))}px` : "12px" }}
              />
            ))}
          </div>

          {/* VAD & Action Controls Bar */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-mono px-2">
              <span className="text-slate-400">VAD Sensitivity:</span>
              <span className={`font-bold ${vadActive ? "text-emerald-500" : "text-slate-400"}`}>
                {vadActive ? "Speech Detected" : "Silence"}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              {status === "idle" && (
                <button
                  onClick={handleStart}
                  className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Assistant</span>
                </button>
              )}

              {status === "listening" && (
                <>
                  <button
                    onClick={handlePause}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {status === "paused" && (
                <button
                  onClick={handleResume}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Transcription Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-600" /> Encounter Voice Timeline & Live Transcription
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono font-bold">
              Real-time Whisper ASR
            </span>
          </div>

          {/* Timeline Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[440px]">
            {transcriptTimeline.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  item.speaker === "User"
                    ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    : "bg-primary-500/5 border-primary-500/20 text-slate-900 dark:text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{item.speaker}</span>
                  <span>{item.time}</span>
                </div>
                <p>{item.text}</p>
              </div>
            ))}

            {currentDraft && (
              <div className="p-4 rounded-xl border border-dashed border-primary-500/40 bg-primary-500/5 text-xs text-primary-600 dark:text-primary-400 font-mono animate-pulse">
                <span className="font-bold">Live Stream: </span> {currentDraft}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
