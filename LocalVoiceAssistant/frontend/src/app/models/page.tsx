"use client";

import React, { useState } from "react";
import { Cpu, Zap, HardDrive, Play, Square, RefreshCw, BarChart2, CheckCircle2, ShieldCheck, Download, Sparkles } from "lucide-react";

interface ModelInfo {
  name: string;
  category: "LLM" | "ASR" | "TTS" | "Translation";
  status: "Loaded" | "Unloaded" | "Standby";
  vram: string;
  ram: string;
  size: string;
  context: string;
  speed: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([
    { name: "Qwen 3.5 9B (Medical Fine-Tune)", category: "LLM", status: "Loaded", vram: "2.0 GB", ram: "4.2 GB", size: "5.4 GB", context: "16K tokens", speed: "48.5 t/s" },
    { name: "Llama 3 8B Clinical", category: "LLM", status: "Unloaded", vram: "0.0 GB", ram: "0.0 GB", size: "4.8 GB", context: "8K tokens", speed: "52.0 t/s" },
    { name: "Gemma 4B Instruct", category: "LLM", status: "Unloaded", vram: "0.0 GB", ram: "0.0 GB", size: "2.6 GB", context: "8K tokens", speed: "68.0 t/s" },
    { name: "Mistral 7B Instruct", category: "LLM", status: "Unloaded", vram: "0.0 GB", ram: "0.0 GB", size: "4.1 GB", context: "8K tokens", speed: "46.2 t/s" },
    { name: "Whisper Large V3 (ASR)", category: "ASR", status: "Loaded", vram: "1.2 GB", ram: "2.1 GB", size: "3.1 GB", context: "30 sec audio", speed: "Real-time" },
    { name: "Fish Speech S2 Pro (TTS)", category: "TTS", status: "Loaded", vram: "0.8 GB", ram: "1.5 GB", size: "1.9 GB", context: "Streaming", speed: "Real-time" },
    { name: "Indic-Trans2 / NLLB", category: "Translation", status: "Loaded", vram: "0.6 GB", ram: "1.2 GB", size: "1.4 GB", context: "Multilingual", speed: "120 t/s" },
  ]);

  const [benchmarking, setBenchmarking] = useState<string | null>(null);

  const toggleLoad = (index: number) => {
    setModels(prev => prev.map((m, i) => {
      if (i === index) {
        const nextStatus = m.status === "Loaded" ? "Unloaded" : "Loaded";
        return {
          ...m,
          status: nextStatus,
          vram: nextStatus === "Loaded" ? "2.0 GB" : "0.0 GB",
          ram: nextStatus === "Loaded" ? "3.5 GB" : "0.0 GB",
        };
      }
      return m;
    }));
  };

  const handleBenchmark = (name: string) => {
    setBenchmarking(name);
    setTimeout(() => {
      setBenchmarking(null);
      alert(`Benchmark completed for ${name}: 51.4 tokens/sec, Latency 138ms.`);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Installed AI Engine Models
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                vLLM & ONNX Runtime
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage local VRAM allocation, model loading state, and inference speed benchmarking</p>
          </div>
        </div>
      </div>

      {/* Models Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {models.map((model, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-primary-600/40 transition duration-200"
          >
            {/* Left Model Details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{model.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {model.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  model.status === "Loaded" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                }`}>
                  {model.status}
                </span>
              </div>

              {/* Hardware Stats Pills */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> VRAM: <strong className="text-slate-800 dark:text-slate-200">{model.vram}</strong></span>
                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-purple-500" /> RAM: <strong className="text-slate-800 dark:text-slate-200">{model.ram}</strong></span>
                <span>Disk Size: <strong className="text-slate-800 dark:text-slate-200">{model.size}</strong></span>
                <span>Context: <strong className="text-slate-800 dark:text-slate-200">{model.context}</strong></span>
                <span>Speed: <strong className="text-emerald-500">{model.speed}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
              <button
                onClick={() => toggleLoad(idx)}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  model.status === "Loaded"
                    ? "bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-600/20"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                }`}
              >
                {model.status === "Loaded" ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{model.status === "Loaded" ? "Unload" : "Load Model"}</span>
              </button>

              <button
                onClick={() => handleBenchmark(model.name)}
                disabled={benchmarking === model.name}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold transition flex items-center space-x-1"
              >
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{benchmarking === model.name ? "Testing..." : "Benchmark"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
