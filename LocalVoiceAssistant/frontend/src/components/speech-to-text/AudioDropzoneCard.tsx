"use client";

import React, { useState, useRef } from "react";
import { Upload, Mic, FileAudio, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AudioDropzoneCardProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onFileUpload: (file: File) => void;
}

export const AudioDropzoneCard: React.FC<AudioDropzoneCardProps> = ({
  isRecording,
  onToggleRecording,
  onFileUpload
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.includes("audio")) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-6 shadow-healthcare dark:shadow-healthcare-dark">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-primary-600" /> Audio Input Source & Capture
        </h2>
        <span className="text-[11px] font-mono text-slate-400">Supported: WAV, MP3, FLAC</span>
      </div>

      {/* Live Record Primary Action */}
      <Button
        variant={isRecording ? "danger" : "primary"}
        size="lg"
        onClick={onToggleRecording}
        className="w-full py-4 shadow-md flex items-center justify-center space-x-3 text-sm font-bold"
      >
        <span className="relative flex h-3 w-3">
          {isRecording && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? "bg-white" : "bg-red-400"}`}></span>
        </span>
        <span>{isRecording ? "Stop Live Recording" : "Start Live Record"}</span>
      </Button>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-primary-600 bg-primary-600/5 dark:bg-primary-950/20 scale-[1.01]"
            : "border-slate-200 dark:border-slate-800 hover:border-primary-600/50 bg-slate-50/50 dark:bg-slate-950/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {isDragOver ? "Drop Audio File to Transcribe" : "Drag & Drop Audio Files Here"}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 font-sans">or click to browse your file directory</p>
      </div>
    </div>
  );
};
