"use client";

import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Settings, Moon, Sun, Cpu, Volume2, Languages, Sliders, HardDrive, Terminal, Save, RotateCcw, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [appLanguage, setAppLanguage] = useState("English (US)");
  const [selectedGpu, setSelectedGpu] = useState("NVIDIA RTX 4090 (24GB VRAM)");
  const [cpuFallback, setCpuFallback] = useState(true);
  const [contextLength, setContextLength] = useState("16384");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [audioInput, setAudioInput] = useState("Default System Microphone (Realtek Audio)");
  const [audioOutput, setAudioOutput] = useState("Default System Speakers (Realtek Audio)");
  const [modelDir, setModelDir] = useState("C:\\Users\\Nebula5\\Desktop\\TTS\\LocalVoiceAssistant\\models");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-600/10 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              System Configuration & Hardware Settings
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 font-mono">
                Local Hardware Control
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure GPU allocation, LLM inference parameters, audio input/output devices, and system backups</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-primary-600/30"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? "Saved Settings!" : "Save Settings"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Theme, Language, GPU & Inference Settings */}
        <div className="space-y-6">
          {/* Theme & Display Mode */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              {theme === "dark" ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />} Appearance & Theme Mode
            </h2>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">System Visual Theme</span>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition border border-slate-200 dark:border-slate-700 flex items-center space-x-2"
              >
                {theme === "light" ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>Active: {theme === "light" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </div>

          {/* GPU & Hardware Acceleration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Cpu className="w-4 h-4 text-primary-600" /> GPU Acceleration & Fallback
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary GPU Device</label>
                <select
                  value={selectedGpu}
                  onChange={(e) => setSelectedGpu(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="NVIDIA RTX 4090 (24GB VRAM)">NVIDIA RTX 4090 (24GB VRAM)</option>
                  <option value="NVIDIA RTX 3080 (10GB VRAM)">NVIDIA RTX 3080 (10GB VRAM)</option>
                  <option value="CPU Only Mode">CPU Only Mode</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Enable Automatic CPU Fallback</span>
                <input
                  type="checkbox"
                  checked={cpuFallback}
                  onChange={(e) => setCpuFallback(e.target.checked)}
                  className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Inference Hyperparameters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-amber-500" /> Inference Hyperparameters
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Temperature (Creativity vs Determinism):</span>
                  <span className="font-mono font-bold text-primary-600">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Top-P Sampling:</span>
                  <span className="font-mono font-bold text-primary-600">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Devices, Directories, System Utilities */}
        <div className="space-y-6">
          {/* Audio Input / Output Device Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Volume2 className="w-4 h-4 text-purple-500" /> Audio Device Input & Output
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Microphone Device</label>
                <select
                  value={audioInput}
                  onChange={(e) => setAudioInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Default System Microphone (Realtek Audio)">Default System Microphone (Realtek Audio)</option>
                  <option value="USB Medical Grade Microphone">USB Medical Grade Microphone</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Speaker Output Device</label>
                <select
                  value={audioOutput}
                  onChange={(e) => setAudioOutput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Default System Speakers (Realtek Audio)">Default System Speakers (Realtek Audio)</option>
                  <option value="Headphones (Realtek Audio)">Headphones (Realtek Audio)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Model Directory Path */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <HardDrive className="w-4 h-4 text-emerald-500" /> Model Directory & Storage Path
            </h2>

            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Local Models Path</label>
              <input
                type="text"
                value={modelDir}
                onChange={(e) => setModelDir(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* System Utilities: Logs, Backup & Restore */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Terminal className="w-4 h-4 text-blue-500" /> System Backup, Restore & Logs
            </h2>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <Link
                href="/logs"
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-semibold transition"
              >
                View System Logs
              </Link>
              <button
                onClick={() => alert("Backup created in scratch/backup.zip")}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold transition"
              >
                Backup Data
              </button>
              <button
                onClick={() => alert("System restored from last checkpoint.")}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold transition"
              >
                Restore Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
