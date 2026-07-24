"use client";

import { useState } from "react";

export default function VoiceModePage() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("Click Push-To-Talk to speak to your local assistant...");
  const [response, setResponse] = useState("Local speech pipeline ready.");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript("Listening locally via Whisper Large V3...");
      setTimeout(() => {
        setTranscript("What is the speed of light?");
        setIsSpeaking(true);
        setResponse("The speed of light in a vacuum is approximately 299,792,458 meters per second.");
        setTimeout(() => setIsSpeaking(false), 4000);
      }, 2500);
    }
  };

  const interruptSpeaking = () => {
    setIsSpeaking(false);
    setResponse("Playback interrupted.");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl w-full mx-auto text-center">
      <div className="bg-surface border border-gray-800 p-8 rounded-2xl w-full shadow-2xl flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-bold text-white tracking-wide">Voice Assistant Mode</h1>
        <p className="text-sm text-gray-400">Full-duplex local voice interaction (Mic → Whisper → LLM → Fish Speech → Speaker)</p>

        {/* Dynamic Voice Visualizer Sphere */}
        <div className="relative flex items-center justify-center my-6">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isSpeaking 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse scale-110 shadow-purple-500/50" 
              : isListening 
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 animate-ping shadow-blue-500/50" 
                : "bg-gray-800 border-2 border-gray-700"
          }`}>
            <span className="text-4xl">
              {isSpeaking ? "🔊" : isListening ? "🎙️" : "🎧"}
            </span>
          </div>
        </div>

        {/* Live Transcript & Response Display */}
        <div className="w-full space-y-3 bg-cardBg border border-gray-800 p-4 rounded-xl text-left">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">User Transcript:</span>
            <p className="text-sm text-gray-200 mt-1">{transcript}</p>
          </div>
          <div className="border-t border-gray-800 pt-3">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Assistant Response:</span>
            <p className="text-sm text-gray-200 mt-1">{response}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4 pt-2">
          <button
            onClick={toggleListening}
            className={`px-8 py-4 rounded-full font-bold text-sm tracking-wide transition shadow-lg ${
              isListening
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            }`}
          >
            {isListening ? "Stop Listening" : "Push-To-Talk"}
          </button>

          {isSpeaking && (
            <button
              onClick={interruptSpeaking}
              className="px-6 py-4 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-sm transition shadow"
            >
              Interrupt Speaking
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-4 py-4 rounded-full border transition ${
              isMuted ? "bg-red-900/60 border-red-700 text-red-300" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {isMuted ? "🔇 Muted" : "🎙️ Mic On"}
          </button>
        </div>
      </div>
    </div>
  );
}
