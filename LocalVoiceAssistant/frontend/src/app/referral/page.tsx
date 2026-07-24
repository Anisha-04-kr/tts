"use client";

import React, { useState } from "react";
import { FileSignature, Download, Printer, Check, Copy, Sparkles, Building2, UserCheck, Stethoscope } from "lucide-react";

export default function ReferralPage() {
  const [patientName, setPatientName] = useState("Eleanor Vance");
  const [patientAge, setPatientAge] = useState("62");
  const [patientGender, setPatientGender] = useState("Female");
  const [diagnosis, setDiagnosis] = useState("Refractory Essential Hypertension with suspicious carotid bruit");
  const [reason, setReason] = useState("Specialist evaluation, carotid duplex ultrasound scan, and antihypertensive therapy optimization.");
  const [hospital, setHospital] = useState("St. Jude Memorial Cardiology & Vascular Institute");
  const [doctorName, setDoctorName] = useState("Dr. Arthur Pendelton, MD");
  const [referredDoctor, setReferredDoctor] = useState("Dr. Sarah Lin, FACC (Consultant Cardiologist)");

  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLetter = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedLetter(`MEDICAL REFERRAL LETTER
Date: 2026-07-24

TO: ${referredDoctor}
FACILITY: ${hospital}

RE: Patient ${patientName} (Age: ${patientAge}, Gender: ${patientGender})

Dear Dr. Sarah Lin,

I am referring ${patientName} for specialized cardiology evaluation regarding:
${diagnosis}.

REASON FOR REFERRAL:
${reason}

CURRENT CLINICAL SUMMARY:
The patient presents with persistent blood pressure elevation despite dual-agent therapy. Auscultation reveals a faint right carotid bruit. Renal panel and baseline ECG attached.

Thank you for providing your expert consultation and co-management for this patient.

Sincerely,

_______________________________
${doctorName}
Offline AI Healthcare System Provider`);
    }, 800);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Medical Referral Letter Generator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                Professional Formatting
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate standardized clinical referral letters for specialist consultation and hospital transfers</p>
          </div>
        </div>

        {generatedLetter && (
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Referral Information Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono pb-2 border-b border-slate-200 dark:border-slate-800">
            Referral Encounter Form
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Age</label>
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Gender</label>
              <input
                type="text"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Primary Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Reason for Referral</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Destination Hospital</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Consultant / Specialist</label>
              <input
                type="text"
                value={referredDoctor}
                onChange={(e) => setReferredDoctor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateLetter}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Formatting Referral..." : "Generate Referral Letter"}</span>
          </button>
        </div>

        {/* Right Column: Letter Document Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono pb-2 border-b border-slate-200 dark:border-slate-800">
            Professional Letter Document Preview
          </h2>

          <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed min-h-[300px] whitespace-pre-wrap">
            {generatedLetter || <span className="text-slate-400 italic">Fill form and click Generate Referral Letter...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
