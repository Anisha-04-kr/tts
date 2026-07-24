export default function AboutPage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-white">About Local AI Voice Assistant</h1>
        <p className="text-sm text-gray-300 leading-relaxed">
          A production-ready, 100% offline AI Voice Assistant built strictly for local execution on Windows.
        </p>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <h3 className="text-md font-bold text-blue-400">Strict Privacy & Local Stack</h3>
          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
            <li><strong>ASR Engine</strong>: Whisper Large V3 (Local)</li>
            <li><strong>LLM Engine</strong>: LM Studio / vLLM OpenAI-Compatible Adapters</li>
            <li><strong>TTS Engine</strong>: Fish Speech v1.5 S2 Pro served via vLLM-Omni</li>
            <li><strong>Voice Activity Detection</strong>: RMS Energy & Zero-Crossing VAD</li>
            <li><strong>Storage</strong>: Local SQLite Database (<code>temp/conversations.db</code>)</li>
            <li><strong>Logging</strong>: Local Rotating Log File (<code>logs/backend.log</code>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
