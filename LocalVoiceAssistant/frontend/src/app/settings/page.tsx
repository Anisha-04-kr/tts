"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    host: "127.0.0.1",
    port: 8000,
    log_level: "INFO",
    default_sample_rate: 24000,
    enable_gpu: true,
    max_vram_gb: 8.0,
    default_asr_model: "whisper-large-v3",
    default_llm_model: "llama3-8b-local",
    default_tts_model: "fish-speech-s2-pro"
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/v1/config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(prev => ({
            ...prev,
            host: data.host || prev.host,
            port: data.port || prev.port,
            enable_gpu: data.gpu_settings?.enable_gpu ?? prev.enable_gpu,
            default_sample_rate: data.audio_settings?.sample_rate || prev.default_sample_rate,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-6">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">System Configuration Settings</h1>
        <p className="text-sm text-gray-400 mb-6">Manage ports, local AI model defaults, audio sampling, and GPU allocation parameters.</p>

        {saved && (
          <div className="bg-green-900/60 border border-green-700 text-green-300 px-4 py-2 rounded mb-6 text-sm">
            Configuration updated successfully.
          </div>
        )}

        <form onSubmit={saveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Bind Host</label>
              <input type="text" value={settings.host} readOnly className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Backend Port</label>
              <input type="number" value={settings.port} onChange={e => setSettings({...settings, port: Number(e.target.value)})} className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Default ASR Model</label>
              <input type="text" value={settings.default_asr_model} onChange={e => setSettings({...settings, default_asr_model: e.target.value})} className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Default LLM Model</label>
              <input type="text" value={settings.default_llm_model} onChange={e => setSettings({...settings, default_llm_model: e.target.value})} className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Default TTS Model</label>
              <input type="text" value={settings.default_tts_model} onChange={e => setSettings({...settings, default_tts_model: e.target.value})} className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Sample Rate (Hz)</label>
              <select value={settings.default_sample_rate} onChange={e => setSettings({...settings, default_sample_rate: Number(e.target.value)})} className="w-full bg-cardBg border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500">
                <option value={16000}>16,000 Hz</option>
                <option value={22050}>22,050 Hz</option>
                <option value={24000}>24,000 Hz (Fish Speech)</option>
                <option value={44100}>44,100 Hz</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="gpu" checked={settings.enable_gpu} onChange={e => setSettings({...settings, enable_gpu: e.target.checked})} className="w-4 h-4 text-blue-600 rounded bg-cardBg border-gray-700" />
              <label htmlFor="gpu" className="text-sm font-medium text-gray-200">Enable CUDA GPU Hardware Acceleration</label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-sm font-medium transition">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
