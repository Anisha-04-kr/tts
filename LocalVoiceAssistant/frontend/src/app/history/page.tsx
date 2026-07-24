"use client";

import { useState, useEffect } from "react";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadSessions = () => {
    fetch("/api/v1/conversation/sessions?include_archived=true")
      .then(res => res.json())
      .then(data => setSessions(data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const renameSession = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await fetch(`/api/v1/conversation/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      setEditingId(null);
      loadSessions();
    } catch (err) {}
  };

  const archiveSession = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/conversation/sessions/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: !currentStatus }),
      });
      loadSessions();
    } catch (err) {}
  };

  const deleteSession = async (id: string) => {
    try {
      await fetch(`/api/v1/conversation/sessions/${id}`, { method: "DELETE" });
      loadSessions();
    } catch (err) {}
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Conversation History & Local Storage</h1>
        <p className="text-sm text-gray-400">Stored locally in SQLite (<code>temp/conversations.db</code>)</p>
      </div>

      <div className="space-y-4">
        {sessions.map(s => (
          <div key={s.session_id} className={`bg-surface border border-gray-800 p-5 rounded-xl flex items-center justify-between shadow ${s.is_archived ? "opacity-60" : ""}`}>
            <div className="flex-1 mr-4">
              {editingId === s.session_id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="bg-cardBg border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500"
                  />
                  <button onClick={() => renameSession(s.session_id)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded font-semibold">Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <h3 className="text-md font-bold text-white">{s.title}</h3>
                  {s.is_archived === 1 && (
                    <span className="bg-yellow-900/60 text-yellow-300 text-xs px-2 py-0.5 rounded border border-yellow-700">Archived</span>
                  )}
                  <button onClick={() => { setEditingId(s.session_id); setEditTitle(s.title); }} className="text-xs text-blue-400 hover:underline">Rename</button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Session ID: <code className="text-blue-400">{s.session_id}</code></p>
              <p className="text-xs text-gray-400">Date: {new Date(s.created_at).toLocaleString()}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => archiveSession(s.session_id, s.is_archived === 1)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded border border-gray-700 transition"
              >
                {s.is_archived === 1 ? "Unarchive" : "Archive"}
              </button>
              <a
                href={`/api/v1/conversation/sessions/${s.session_id}/export?format=markdown`}
                download
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded border border-gray-700 transition"
              >
                Export MD
              </a>
              <a
                href={`/api/v1/conversation/sessions/${s.session_id}/export?format=json`}
                download
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded border border-gray-700 transition"
              >
                Export JSON
              </a>
              <button
                onClick={() => deleteSession(s.session_id)}
                className="bg-red-900/60 hover:bg-red-800 text-red-200 text-xs px-3 py-1.5 rounded border border-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
