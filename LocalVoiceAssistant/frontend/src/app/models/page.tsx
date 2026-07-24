"use client";

import { useState, useEffect } from "react";

interface ModelItem {
  id: string;
  name: string;
  type: string;
  provider: string;
  is_active: boolean;
  is_installed: boolean;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelItem[]>([
    { id: "whisper-large-v3", name: "Whisper Large V3", type: "asr", provider: "whisper", is_active: true, is_installed: true },
    { id: "llama3-8b-local", name: "Meta Llama 3 8B Instruct", type: "llm", provider: "lmstudio", is_active: true, is_installed: true },
    { id: "vllm-mistral-7b-local", name: "Mistral 7B Instruct", type: "llm", provider: "vllm", is_active: false, is_installed: true },
    { id: "fish-speech-s2-pro", name: "Fish Speech v1.5 S2 Pro", type: "tts", provider: "fishspeech", is_active: true, is_installed: true }
  ]);

  const switchModel = async (id: string, type: string, provider: string) => {
    try {
      const res = await fetch("/api/v1/models/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_type: type, model_name: id, provider }),
      });
      if (res.ok) {
        setModels(prev => prev.map(m => m.type === type ? { ...m, is_active: m.id === id } : m));
      }
    } catch (err) {}
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Local Model Manager</h1>
        <p className="text-sm text-gray-400">Scan, validate, and hot-swap active local AI model providers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map(m => (
          <div key={m.id} className="bg-surface border border-gray-800 p-5 rounded-xl flex flex-col justify-between shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800 text-blue-400">
                  {m.type}
                </span>
                {m.is_active ? (
                  <span className="bg-green-900/60 text-green-300 text-xs px-2 py-0.5 rounded border border-green-700 font-medium">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">Standby</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white">{m.name}</h3>
              <p className="text-xs text-gray-400 mt-1">Provider Engine: <code className="text-purple-400">{m.provider}</code></p>
              <p className="text-xs text-gray-400">ID: <code>{m.id}</code></p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
              {!m.is_active && (
                <button
                  onClick={() => switchModel(m.id, m.type, m.provider)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  Set as Active
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
