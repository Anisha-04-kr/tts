"use client";

import { useState } from "react";

export default function MedicalAssistantPage() {
  const [activeTab, setActiveTab] = useState<"soap" | "icd10" | "referral" | "summarize">("soap");
  const [transcript, setTranscript] = useState("Patient presents with 3-day history of sharp chest pain on inspiration. Blood pressure 130/85, heart rate 78 bpm. EKG shows sinus rhythm with no ST elevation. Plan to obtain troponin levels and chest X-ray.");
  const [icdQuery, setIcdQuery] = useState("Acute chest pain on breathing");
  const [patientName, setPatientName] = useState("Jane Doe");
  const [referralSummary, setReferralSummary] = useState("Patient evaluated for recurrent palpitations and dyspnea on exertion. EKG demonstrates non-specific T-wave changes. Requesting echocardiogram evaluation.");
  const [specialist, setSpecialist] = useState("Cardiologist");
  const [reportText, setReportText] = useState("CHEST RADIOGRAPH 2-VIEWS: Lungs are clear without focal consolidation or pneumothorax. Cardiomediastinal silhouette is within normal limits. Impression: Normal chest X-ray.");

  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runSoapGenerator = async () => {
    setIsLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/v1/medical/soap-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setOutput(data.soap_note || "No output received.");
    } catch (err) {
      setOutput("Error processing medical request.");
    } finally {
      setIsLoading(false);
    }
  };

  const runIcdLookup = async () => {
    setIsLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/v1/medical/icd10-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: icdQuery }),
      });
      const data = await res.json();
      setOutput(data.icd10_results || "No output received.");
    } catch (err) {
      setOutput("Error looking up ICD-10 codes.");
    } finally {
      setIsLoading(false);
    }
  };

  const runReferralDrafter = async () => {
    setIsLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/v1/medical/referral-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName,
          clinical_summary: referralSummary,
          specialist_type: specialist
        }),
      });
      const data = await res.json();
      setOutput(data.referral_letter || "No output received.");
    } catch (err) {
      setOutput("Error drafting referral letter.");
    } finally {
      setIsLoading(false);
    }
  };

  const runReportSummarizer = async () => {
    setIsLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/v1/medical/summarize-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_text: reportText }),
      });
      const data = await res.json();
      setOutput(data.summary || "No output received.");
    } catch (err) {
      setOutput("Error summarizing report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-2xl">🩺</span>
            <h1 className="text-2xl font-bold text-white">Medical Assistant Mode</h1>
            <span className="bg-purple-900/60 text-purple-300 text-xs px-2.5 py-0.5 rounded border border-purple-700 font-semibold">
              Clinical Local AI
            </span>
          </div>
          <p className="text-sm text-gray-400">100% Offline Clinical Documentation, SOAP Notes, ICD-10 Coding & Medical Summaries.</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("soap")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "soap" ? "bg-blue-600 text-white" : "bg-cardBg text-gray-400 hover:text-white"
          }`}
        >
          📋 SOAP Notes
        </button>
        <button
          onClick={() => setActiveTab("icd10")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "icd10" ? "bg-blue-600 text-white" : "bg-cardBg text-gray-400 hover:text-white"
          }`}
        >
          🔍 ICD-10 Lookup
        </button>
        <button
          onClick={() => setActiveTab("referral")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "referral" ? "bg-blue-600 text-white" : "bg-cardBg text-gray-400 hover:text-white"
          }`}
        >
          ✉️ Specialist Referral
        </button>
        <button
          onClick={() => setActiveTab("summarize")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "summarize" ? "bg-blue-600 text-white" : "bg-cardBg text-gray-400 hover:text-white"
          }`}
        >
          📄 Report Summarizer
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-surface border border-gray-800 p-5 rounded-xl space-y-4 shadow">
          {activeTab === "soap" && (
            <>
              <h3 className="text-md font-bold text-white">Clinical Conversation Transcript</h3>
              <textarea
                rows={6}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                className="w-full bg-cardBg border border-gray-700 rounded p-3 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={runSoapGenerator}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                Generate SOAP Note
              </button>
            </>
          )}

          {activeTab === "icd10" && (
            <>
              <h3 className="text-md font-bold text-white">Symptom / Diagnosis Query</h3>
              <input
                type="text"
                value={icdQuery}
                onChange={e => setIcdQuery(e.target.value)}
                className="w-full bg-cardBg border border-gray-700 rounded p-3 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={runIcdLookup}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                Lookup ICD-10 Codes
              </button>
            </>
          )}

          {activeTab === "referral" && (
            <>
              <h3 className="text-md font-bold text-white">Specialist Referral Details</h3>
              <div>
                <label className="text-xs uppercase text-gray-400 font-bold">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full bg-cardBg border border-gray-700 rounded p-2 text-sm text-gray-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-400 font-bold">Specialist Specialty</label>
                <input
                  type="text"
                  value={specialist}
                  onChange={e => setSpecialist(e.target.value)}
                  className="w-full bg-cardBg border border-gray-700 rounded p-2 text-sm text-gray-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-400 font-bold">Clinical Reason / Summary</label>
                <textarea
                  rows={4}
                  value={referralSummary}
                  onChange={e => setReferralSummary(e.target.value)}
                  className="w-full bg-cardBg border border-gray-700 rounded p-2 text-sm text-gray-200 mt-1"
                />
              </div>
              <button
                onClick={runReferralDrafter}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                Draft Referral Letter
              </button>
            </>
          )}

          {activeTab === "summarize" && (
            <>
              <h3 className="text-md font-bold text-white">Raw Medical Report / Lab Notes</h3>
              <textarea
                rows={6}
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                className="w-full bg-cardBg border border-gray-700 rounded p-3 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={runReportSummarizer}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                Summarize Report
              </button>
            </>
          )}
        </div>

        {/* Output Column */}
        <div className="bg-surface border border-gray-800 p-5 rounded-xl flex flex-col shadow">
          <h3 className="text-md font-bold text-purple-400 mb-3">Structured Clinical Output</h3>
          <div className="flex-1 bg-black/80 border border-gray-800 rounded p-4 text-sm font-mono text-gray-200 whitespace-pre-wrap overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <span className="text-blue-400 animate-pulse">Processing clinical reasoning locally...</span>
            ) : (
              output || "Output results will appear here."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
