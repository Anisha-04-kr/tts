"""
Persistent Conversation Manager using local SQLite storage for session history, search, export, archive, and import.
"""

import sqlite3
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.config.settings import settings
from backend.logger import logger, log_event

class ConversationManager:
    """Manages persistent conversation sessions and message logs in local SQLite database."""

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path or (settings.TEMP_DIR / "conversations.db")
        self._init_database()

    def _get_connection(self) -> sqlite3.Connection:
        """Helper to open SQLite database connection."""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_database(self) -> None:
        """Initializes SQLite tables and performs migrations for sessions and messages."""
        log_event("conversation", f"Initializing local SQLite conversation database: {self.db_path}")
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    is_pinned INTEGER DEFAULT 0,
                    is_archived INTEGER DEFAULT 0
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    message_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
                )
            """)
            
            # Migration check for is_archived column on existing tables
            cursor.execute("PRAGMA table_info(sessions)")
            columns = [col["name"] for col in cursor.fetchall()]
            if "is_archived" not in columns:
                cursor.execute("ALTER TABLE sessions ADD COLUMN is_archived INTEGER DEFAULT 0")
                
            conn.commit()

    def create_session(self, title: str = "New Conversation") -> Dict[str, Any]:
        """Creates a new conversation session with a unique UUID."""
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO sessions (session_id, title, created_at, updated_at, is_archived) VALUES (?, ?, ?, ?, 0)",
                (session_id, title, now, now)
            )
            conn.commit()
        
        log_event("conversation", f"Created session: {session_id} ('{title}')")
        return {"session_id": session_id, "title": title, "created_at": now, "updated_at": now, "is_archived": 0, "messages": []}

    def list_sessions(self, include_archived: bool = False) -> List[Dict[str, Any]]:
        """Lists all conversation sessions ordered by last update time."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_archived:
                rows = cursor.execute("SELECT * FROM sessions ORDER BY updated_at DESC").fetchall()
            else:
                rows = cursor.execute("SELECT * FROM sessions WHERE is_archived = 0 ORDER BY updated_at DESC").fetchall()
            return [dict(r) for r in rows]

    def rename_session(self, session_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        """Renames an existing session's title."""
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE sessions SET title = ?, updated_at = ? WHERE session_id = ?", (new_title, now, session_id))
            conn.commit()
        log_event("conversation", f"Renamed session {session_id} to '{new_title}'")
        return self.get_session(session_id)

    def archive_session(self, session_id: str, archive_status: bool = True) -> Optional[Dict[str, Any]]:
        """Archives or unarchives a conversation session."""
        val = 1 if archive_status else 0
        now = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE sessions SET is_archived = ?, updated_at = ? WHERE session_id = ?", (val, now, session_id))
            conn.commit()
        log_event("conversation", f"Updated archive status for session {session_id} (is_archived={val})")
        return self.get_session(session_id)

    def import_session(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Imports a conversation session payload containing title and messages."""
        title = data.get("title", "Imported Conversation")
        session_id = data.get("session_id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO sessions (session_id, title, created_at, updated_at, is_archived) VALUES (?, ?, ?, ?, 0)",
                (session_id, title, now, now)
            )
            for m in data.get("messages", []):
                msg_id = m.get("message_id") or str(uuid.uuid4())
                role = m.get("role", "user")
                content = m.get("content", "")
                ts = m.get("timestamp") or now
                meta = json.dumps(m.get("metadata", {}))
                cursor.execute(
                    "INSERT INTO messages (message_id, session_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)",
                    (msg_id, session_id, role, content, ts, meta)
                )
            conn.commit()

        log_event("conversation", f"Imported session: {session_id} ('{title}') with {len(data.get('messages', []))} messages")
        return self.get_session(session_id) or {}

    def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Appends a message to a target session."""
        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        meta_json = json.dumps(metadata or {})

        with self._get_connection() as conn:
            cursor = conn.cursor()
            sess = cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not sess:
                cursor.execute(
                    "INSERT INTO sessions (session_id, title, created_at, updated_at, is_archived) VALUES (?, ?, ?, ?, 0)",
                    (session_id, content[:30] or "Conversation", now, now)
                )

            cursor.execute(
                "INSERT INTO messages (message_id, session_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)",
                (msg_id, session_id, role, content, now, meta_json)
            )
            cursor.execute("UPDATE sessions SET updated_at = ? WHERE session_id = ?", (now, session_id))
            conn.commit()

        log_event("conversation", f"Added message ({role}) to session {session_id}")
        return {"message_id": msg_id, "session_id": session_id, "role": role, "content": content, "timestamp": now}

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves session details and complete message history."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            sess = cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
            if not sess:
                return None

            msgs = cursor.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC", (session_id,)).fetchall()
            messages = [dict(m) for m in msgs]
            for m in messages:
                if m.get("metadata"):
                    try:
                        m["metadata"] = json.loads(m["metadata"])
                    except Exception:
                        pass
            
            res = dict(sess)
            res["messages"] = messages
            return res

    def get_chat_history_formatted(self, session_id: str, max_messages: int = 10) -> List[Dict[str, str]]:
        """Returns message list formatted for LLM completion input `[{role, content}]`."""
        sess = self.get_session(session_id)
        if not sess or not sess.get("messages"):
            return []
        
        msgs = sess["messages"][-max_messages:]
        return [{"role": m["role"], "content": m["content"]} for m in msgs]

    def reset_session(self, session_id: str) -> bool:
        """Clears all messages inside a session."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            conn.commit()
        log_event("conversation", f"Reset conversation messages for session: {session_id}")
        return True

    def delete_session(self, session_id: str) -> bool:
        """Deletes session and all its messages."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            conn.commit()
        log_event("conversation", f"Deleted session: {session_id}")
        return True

    def search_conversations(self, query: str) -> List[Dict[str, Any]]:
        """Searches across messages for query text match."""
        pattern = f"%{query}%"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            rows = cursor.execute(
                "SELECT DISTINCT session_id, role, content, timestamp FROM messages WHERE content LIKE ? ORDER BY timestamp DESC",
                (pattern,)
            ).fetchall()
            return [dict(r) for r in rows]

    def export_conversation(self, session_id: str, format_type: str = "markdown") -> str:
        """Exports conversation session to Markdown or JSON formatted text."""
        sess = self.get_session(session_id)
        if not sess:
            return "Session not found."

        if format_type.lower() == "json":
            return json.dumps(sess, indent=2)

        lines = [f"# {sess['title']}\n", f"*Session ID*: `{sess['session_id']}`\n", f"*Date*: {sess['created_at']}\n", "---\n"]
        for m in sess.get("messages", []):
            role_name = m["role"].upper()
            lines.append(f"### **{role_name}** ({m['timestamp']})\n{m['content']}\n")
        return "\n".join(lines)

# Singleton instance
conversation_manager = ConversationManager()
