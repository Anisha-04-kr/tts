"use client";

import React, { useRef, useEffect } from "react";
import { Clock, CheckCircle2, User, Stethoscope, Activity } from "lucide-react";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  confidence: number;
}

interface TranscriptionTimelineProps {
  entries: TimelineEntry[];
  isLoading?: boolean;
}

export const TranscriptionTimeline: React.FC<TranscriptionTimelineProps> = ({
  entries,
  isLoading = false
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, isLoading]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-healthcare dark:shadow-healthcare-dark flex flex-col h-[500px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-600" /> Transcription Timeline Thread
        </h2>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono font-bold">
          Whisper V3 Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Audio Transcribed Yet</h3>
            <p className="text-[11px] text-slate-400 max-w-xs">Start live recording or upload an audio file above to see the transcription timeline.</p>
          </div>
        ) : (
          entries.map((entry) => {
            const isDoctor = entry.speaker.toLowerCase().includes("doctor");

            return (
              <div
                key={entry.id}
                className={`flex items-start space-x-3 ${isDoctor ? "flex-row" : "flex-row-reverse space-x-reverse"}`}
              >
                {/* Speaker Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                  isDoctor
                    ? "bg-primary-600 text-white"
                    : "bg-teal-600 text-white"
                }`}>
                  {isDoctor ? <Stethoscope className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Speech Bubble */}
                <div className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-sm border ${
                  isDoctor
                    ? "bg-primary-50/70 dark:bg-slate-950 border-primary-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none"
                    : "bg-teal-50/70 dark:bg-slate-950 border-teal-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-none"
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-primary-600 dark:text-primary-400">{entry.speaker}</span>
                  </div>

                  <p className="whitespace-pre-wrap leading-relaxed font-sans mt-1">{entry.text}</p>

                  <div className="mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {entry.timestamp}</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {(entry.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-primary-600 animate-spin" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs font-mono text-slate-500 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
                <span>Processing live speech stream...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
