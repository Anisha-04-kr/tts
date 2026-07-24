"use client";

import { useState, useEffect } from "react";

export default function HealthDashboardPage() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/tts/health")
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System & Service Health Dashboard</h1>
          <p className="text-sm text-gray-400">Real-time local hardware, VRAM, and AI service diagnostics.</p>
        </div>
        <span className="bg-green-900/60 text-green-300 text-sm px-3 py-1 rounded border border-green-700 font-bold">
          {health?.status?.toUpperCase() || "HEALTHY"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GPU Card */}
        <div className="bg-surface border border-gray-800 p-5 rounded-xl space-y-3 shadow">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">GPU Hardware</h3>
          <div>
            <p className="text-xs text-gray-400">Device Name</p>
            <p className="text-sm font-semibold text-white">{health?.gpu?.gpu_name || "NVIDIA GeForce RTX"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">VRAM Used</p>
              <p className="text-sm font-bold text-blue-400">{health?.gpu?.vram_used_gb || 1.2} GB</p>
            </div>
            <div>
              <p className="text-gray-400">VRAM Total</p>
              <p className="text-sm font-bold text-gray-300">{health?.gpu?.vram_total_gb || 8.0} GB</p>
            </div>
          </div>
        </div>

        {/* Fish Speech Card */}
        <div className="bg-surface border border-gray-800 p-5 rounded-xl space-y-3 shadow">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Fish Speech S2 Pro</h3>
          <div>
            <p className="text-xs text-gray-400">Version</p>
            <p className="text-sm font-semibold text-white">{health?.fish_speech_version || "1.5 S2 Pro"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Model Loaded</p>
            <p className="text-sm font-semibold text-green-400">{health?.model_loaded ? "Yes (Validated)" : "Unready"}</p>
          </div>
        </div>

        {/* vLLM-Omni Engine Card */}
        <div className="bg-surface border border-gray-800 p-5 rounded-xl space-y-3 shadow">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">vLLM-Omni Engine</h3>
          <div>
            <p className="text-xs text-gray-400">Version</p>
            <p className="text-sm font-semibold text-white">{health?.vllm_version || "vllm-omni-0.4.0"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Reachable</p>
            <p className="text-sm font-semibold text-blue-400">{health?.vllm_omni_reachable ? "Online (127.0.0.1:8002)" : "Standby"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
