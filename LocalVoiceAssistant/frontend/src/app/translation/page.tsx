"use client";

import React, { useState } from "react";
import { Languages, ArrowLeftRight, Mic, Volume2, Copy, Check, ShieldCheck, Sparkles, History, FileText } from "lucide-react";

export default function TranslationPage() {
  const [inputLang, setInputLang] = useState("English (US)");
  const [outputLang, setOutputLang] = useState("Spanish (Medical)");
  const [inputText, setInputText] = useState("Patient is experiencing sharp left-sided chest pain radiating to the jaw with mild diaphoresis.");
  const [translatedText, setTranslatedText] = useState("El paciente experimenta un dolor torácico agudo en el lado izquierdo que se irradia a la mandíbula con diaforesis leve.");
  const [isTranslating, setIsTranslating] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [copied, setCopied] = useState(false);

  const [translationHistory] = useState([
    { from: "English", to: "Spanish", text: "Take 500mg Paracetamol", result: "Tome 500mg de Paracetamol" },
    { from: "English", to: "Hindi", text: "Blood pressure is normal", result: "रक्तचाप सामान्य है" },
  ]);

  const handleSwap = () => {
    const tempLang = inputLang;
    setInputLang(outputLang);
    setOutputLang(tempLang);

    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) return;
    setIsTranslating(true);

    try {
      const response = await fetch("/api/v1/translation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          source_language: inputLang,
          target_language: outputLang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translated_text || inputText);
      } else {
        alert("Translation request failed. Please check backend API.");
      }
    } catch (err) {
      console.error("Translation error:", err);
      alert("Error connecting to translation API.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Cross-Lingual Medical Translation
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono">
                IndicTrans2 / NLLB-200
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Translation Model Pipeline: Source Text / Voice → BCP 47 Normalizer → IndicTrans2 / NLLB-200 Engine → Medical Term Preserving Translation</p>


          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMode("text")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              mode === "text" ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" : "text-slate-500"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Translation</span>
          </button>
          <button
            onClick={() => setMode("voice")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              mode === "voice" ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" : "text-slate-500"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Mode</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Source Language</label>
              <select
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="English (US)">English (US)</option>
                <option value="Hindi (Regional)">Hindi (हिन्दी)</option>
                <option value="Tamil (Regional)">Tamil (தமிழ்)</option>
                <option value="Telugu (Regional)">Telugu (తెలుగు)</option>
                <option value="Kannada (Regional)">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam (Regional)">Malayalam (മലയാളം)</option>
                <option value="Marathi (Regional)">Marathi (मराठी)</option>
                <option value="Bengali (Regional)">Bengali (বাংলা)</option>
                <option value="Gujarati (Regional)">Gujarati (ગુજરાતી)</option>
                <option value="Punjabi (Regional)">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="Odia (Regional)">Odia (ଓଡ଼ିଆ)</option>
                <option value="Urdu (Regional)">Urdu (اردو)</option>
                <option value="Assamese (Regional)">Assamese (অসমীয়া)</option>
                <option value="Spanish (Medical)">Spanish (Español)</option>
                <option value="French (Clinical)">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Arabic (Standard)">Arabic (العربية)</option>
                <option value="Mandarin">Mandarin (中文)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Korean">Korean (한국어)</option>
                <option value="Russian">Russian (Русский)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Italian">Italian (Italiano)</option>
              </select>
            </div>

            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter clinical notes, patient complaints, or medical reports to translate..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-sans leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition flex items-center space-x-1.5"
              title="Swap Languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Swap</span>
            </button>

            <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-purple-600/30"
            >
              {isTranslating ? "Translating Terminology..." : "Translate Text"}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Target Language</label>
              <select
                value={outputLang}
                onChange={(e) => setOutputLang(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="Spanish (Medical)">Spanish (Español)</option>
                <option value="Hindi (Regional)">Hindi (हिन्दी)</option>
                <option value="Tamil (Regional)">Tamil (தமிழ்)</option>
                <option value="Telugu (Regional)">Telugu (తెలుగు)</option>
                <option value="Kannada (Regional)">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam (Regional)">Malayalam (മലയാളം)</option>
                <option value="Marathi (Regional)">Marathi (मराठी)</option>
                <option value="Bengali (Regional)">Bengali (বাংলা)</option>
                <option value="Gujarati (Regional)">Gujarati (ગુજરાતી)</option>
                <option value="Punjabi (Regional)">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="Odia (Regional)">Odia (ଓଡ଼ିଆ)</option>
                <option value="Urdu (Regional)">Urdu (اردو)</option>
                <option value="Assamese (Regional)">Assamese (অসমীয়া)</option>
                <option value="English (US)">English (US)</option>
                <option value="French (Clinical)">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Arabic (Standard)">Arabic (العربية)</option>
                <option value="Mandarin">Mandarin (中文)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Korean">Korean (한국어)</option>
                <option value="Russian">Russian (Русский)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Italian">Italian (Italiano)</option>
              </select>
            </div>


            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-sans min-h-[160px] whitespace-pre-wrap">
              {translatedText || <span className="text-slate-400 italic">Translation output will appear here...</span>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Medical Terms Preserved</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition"
                title="Copy Translation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Translation History Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-3 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <History className="w-4 h-4 text-purple-500" /> Recent Translation History
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {translationHistory.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{item.from} → {item.to}</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">&quot;{item.text}&quot;</p>
              <p className="text-purple-600 dark:text-purple-400 font-mono">{item.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
