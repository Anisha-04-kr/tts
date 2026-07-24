"use client";

import React, { useState } from "react";
import { Stethoscope, User, AlertTriangle, ShieldCheck, FileText, Pill, Activity, CheckCircle2, ChevronRight, BookOpen, Send } from "lucide-react";

export default function MedicalAssistantPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "symptoms" | "recommendations" | "interactions">("symptoms");
  const [patientInput, setPatientInput] = useState("64-year-old male presenting with type-2 diabetes, hypertension, taking Metformin 1000mg and Lisinopril 10mg, now reporting bilateral lower extremity edema.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const tabs = [
    { id: "symptoms", label: "Symptom Analysis", icon: Activity },
    { id: "summary", label: "Patient Summary", icon: User },
    { id: "recommendations", label: "Clinical Recommendation", icon: FileText },
    { id: "interactions", label: "Drug Interaction Check", icon: Pill },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Clinical Medical Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-mono">
                Evidence-Based AI
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Offline clinical decision support, symptom differential diagnosis, and drug interaction screening</p>
          </div>
        </div>
      </div>

      {/* Patient Encounter Input Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-3 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">Patient Clinical Presentation & History</label>
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            rows={3}
            value={patientInput}
            onChange={(e) => setPatientInput(e.target.value)}
            placeholder="Type patient symptoms, vital signs, lab values, and active medications..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 font-sans leading-relaxed resize-none"
          />
          <button
            onClick={() => setIsAnalyzing(true)}
            disabled={isAnalyzing}
            className="py-3 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/30 transition shrink-0 flex items-center justify-center space-x-2"
          >
            <span>{isAnalyzing ? "Analyzing..." : "Analyze Encounter"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-6 shadow-sm">
        {activeTab === "symptoms" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Differential Diagnosis & Symptom Analysis</h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-teal-600 dark:text-teal-400">1. Congestive Heart Failure / Fluid Overload (High Probability - 78%)</div>
                <p className="text-slate-600 dark:text-slate-300 font-sans">Bilateral lower extremity edema in diabetic hypertensive patient warranting BNP, chest X-ray, and renal panel evaluation.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-amber-500">2. Medication-Induced Edema (Moderate Probability - 45%)</div>
                <p className="text-slate-600 dark:text-slate-300 font-sans">Rule out CCB addition or renal insufficiency secondary to ACE-i dosage adjustment.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Patient Encounters Summary Digest</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 font-mono">
              <div><span className="text-slate-400">Demographics:</span> 64yo Male</div>
              <div><span className="text-slate-400">Primary Diagnosis:</span> Type-2 Diabetes Mellitus, Essential Hypertension</div>
              <div><span className="text-slate-400">Active Regimen:</span> Metformin 1000mg BID, Lisinopril 10mg QD</div>
              <div><span className="text-slate-400">Chief Complaint:</span> Bilateral lower extremity edema</div>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Evidence-Based Clinical Guidance</h2>
            <ul className="space-y-2 font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>Order Comprehensive Metabolic Panel (CMP), Serum Creatinine, and eGFR.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>Check serum NT-proBNP and obtain 12-lead ECG.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>Evaluate dietary sodium intake and consider low-dose Furosemide 20mg if volume overload confirmed.</span>
              </li>
            </ul>
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Drug-Drug & Renal Interaction Screening</h2>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Metformin + Renal Function Precaution
              </div>
              <p className="font-sans text-xs">Monitor eGFR closely prior to escalating Lisinopril or introducing loop diuretics. If eGFR drops below 30 mL/min/1.73m², discontinue Metformin.</p>
            </div>
          </div>
        )}

        {/* Evidence References Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="font-bold uppercase font-mono text-[10px] text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-teal-500" /> Evidence & Clinical Guidelines Referenced
          </div>
          <p className="text-slate-500 text-[11px] font-mono">1. ACC/AHA Heart Failure Guidelines 2023 • 2. ADA Standards of Medical Care in Diabetes 2024</p>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start space-x-3 text-xs text-slate-500">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Clinical Decision Support Disclaimer: </span>
          Outputs generated by this offline AI assistant are designed for licensed medical professional reference only and do not substitute direct physician evaluation or clinical diagnosis.
        </div>
      </div>
    </div>
  );
}
