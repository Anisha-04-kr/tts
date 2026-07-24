"use client";

import React, { useState } from "react";
import { FileText, Download, Copy, Check, Sparkles, RefreshCw, FileSignature, Edit3 } from "lucide-react";

export default function ClinicalNotesPage() {
  const [activeType, setActiveType] = useState<"soap" | "discharge" | "progress" | "operation" | "prescription">("soap");
  const [noteContent, setNoteContent] = useState(`CLINICAL SOAP NOTE
Date: 2026-07-24 | Time: 10:30 AM
Patient ID: PT-84920 | Age/Sex: 58M

[SUBJECTIVE]
Patient reports persistent headaches for 3 days, accompanied by mild fatigue. Denies fever, nausea, or visual disturbances.

[OBJECTIVE]
BP: 130/84 mmHg | Pulse: 72 bpm | Temp: 98.6°F | SpO2: 99% RA
PE: Alert & oriented x3. HEENT intact. Neurological exam grossly non-focal.

[ASSESSMENT]
1. Tension-type Headache (ICD-10: G44.209)
2. Essential Hypertension, controlled

[PLAN]
1. Hydration & rest recommended.
2. Acetaminophen 500mg PRN for pain (Max 2g/day).
3. Follow up in 1 week if symptoms persist or intensify.`);

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const noteTypes = [
    { id: "soap", label: "SOAP Note" },
    { id: "discharge", label: "Discharge Summary" },
    { id: "progress", label: "Progress Note" },
    { id: "operation", label: "Operation Note" },
    { id: "prescription", label: "Prescription Summary" },
  ];

  const handleGenerate = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setNoteContent(`[GENERATED ${type.toUpperCase()} NOTE]\nPatient Encounter Date: 2026-07-24\n\nFormatted clinical documentation created automatically by Offline Healthcare AI OS.`);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const blob = new Blob([noteContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical_note_${activeType}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Clinical Notes Generator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                Automated Documentation
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate structured SOAP notes, discharge summaries, progress logs, and prescriptions</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold transition flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Note"}</span>
          </button>

          <button
            onClick={handleExportTxt}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition flex items-center space-x-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Note Type Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {noteTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setActiveType(type.id as any);
              handleGenerate(type.label);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeType === type.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Editable Output Textarea Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-emerald-500" /> Editable Clinical Note Document Output
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Autosaved to encounter history</span>
        </div>

        <textarea
          rows={16}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-none shadow-inner"
        />
      </div>
    </div>
  );
}
