"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RiShieldLine, RiFileTextLine, RiUploadLine,
  RiDeleteBinLine, RiAddLine, RiArrowLeftLine,
  RiFileAddLine, RiGlobalLine, RiLockLine
} from "react-icons/ri";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─────────────────────────────────────────
// LOGIN VIEW
// ─────────────────────────────────────────
function LoginView({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!password.trim()) { setError("Password required"); return; }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid password");
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="fixed -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "#6c63ff", filter: "blur(100px)", opacity: 0.10 }} />
      <div className="fixed -bottom-16 -right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "#1a8fff", filter: "blur(100px)", opacity: 0.10 }} />

      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Icon */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
          >
            <RiShieldLine className="text-white text-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-xl">Admin Panel</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              OraAI — Global Knowledge Base
            </p>
          </div>
        </div>

        {/* Password input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
            ADMIN PASSWORD
          </label>
          <div className="relative">
            <RiLockLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "rgba(255,255,255,0.25)" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter admin password"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs"
            style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)", border: "1px solid rgba(255,80,80,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading || !password.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <RiShieldLine className="text-base" />
              Access Admin Panel
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ADD DOCUMENT VIEW
// ─────────────────────────────────────────
function AddDocumentView({ token, onBack, onSaved }) {
  const [mode, setMode] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTitle(""); setContent("");
    setPdfFile(null); setError(null); setSuccess(false);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Only PDF files supported"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB"); return; }
    setPdfFile(file);
    setError(null);
    if (!title.trim()) {
      setTitle(file.name.replace(".pdf", "").replace(/_/g, " ").replace(/-/g, " "));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Title required"); return; }
    if (mode === "text" && !content.trim()) { setError("Content required"); return; }
    if (mode === "pdf" && !pdfFile) { setError("Select a PDF"); return; }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (mode === "text") {
        res = await fetch("/api/admin/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token,
          },
          body: JSON.stringify({ title: title.trim(), content: content.trim() }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("title", title.trim());
        res = await fetch("/api/admin/documents/pdf", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setSuccess(true);
      resetForm();
      setTimeout(() => { setSuccess(false); onSaved(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-white/40 hover:text-white/80 transition-colors">
          <RiArrowLeftLine className="text-lg" />
        </button>
        <h2 className="text-white font-semibold">Add Global Document</h2>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ background: "rgba(108,99,255,0.12)", color: "rgba(167,139,250,0.9)", border: "1px solid rgba(108,99,255,0.2)" }}
      >
        🌐 This document will be available to <strong>all users</strong> via RAG search.
      </div>

      {/* Mode toggle */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {["text", "pdf"].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); resetForm(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: mode === m ? "rgba(108,99,255,0.25)" : "transparent",
              color: mode === m ? "#a78bfa" : "rgba(255,255,255,0.35)",
            }}
          >
            {m === "text" ? <RiFileTextLine /> : <RiUploadLine />}
            {m === "text" ? "Text" : "PDF"}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>TITLE</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(null); }}
          placeholder="e.g. Company Leave Policy"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />
      </div>

      {/* Text mode */}
      {mode === "text" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>CONTENT</label>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{content.length} chars</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setError(null); }}
            placeholder="Paste company document content here..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none transition-all leading-relaxed"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </div>
      )}

      {/* PDF mode */}
      {mode === "pdf" && (
        <label
          className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl cursor-pointer transition-all"
          style={{
            background: pdfFile ? "rgba(108,99,255,0.08)" : "rgba(255,255,255,0.03)",
            border: pdfFile ? "2px dashed rgba(108,99,255,0.4)" : "2px dashed rgba(255,255,255,0.12)",
          }}
        >
          <input type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
          {pdfFile ? (
            <>
              <RiFileTextLine className="text-3xl" style={{ color: "#a78bfa" }} />
              <span className="text-sm font-medium" style={{ color: "rgba(167,139,250,0.9)" }}>{pdfFile.name}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                {(pdfFile.size / 1024).toFixed(1)} KB · click to change
              </span>
            </>
          ) : (
            <>
              <RiUploadLine className="text-3xl text-white/20" />
              <span className="text-sm text-white/30">Click to upload PDF</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>Max 10MB</span>
            </>
          )}
        </label>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)", border: "1px solid rgba(255,80,80,0.2)" }}>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(50,200,120,0.1)", color: "rgba(80,220,140,0.9)", border: "1px solid rgba(50,200,120,0.2)" }}>
          ✓ Global document saved and indexed successfully
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading || !title.trim() || (mode === "text" && !content.trim()) || (mode === "pdf" && !pdfFile)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {mode === "pdf" ? "Extracting & indexing..." : "Chunking & indexing..."}
          </>
        ) : (
          <>
            <RiGlobalLine className="text-base" />
            Save as Global Document
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// DOCUMENT LIST VIEW
// ─────────────────────────────────────────
function DocumentListView({ token, onAdd }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/documents", {
        headers: { "x-admin-token": token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async (docId) => {
    if (!confirm("Delete this global document and all its chunks?")) return;
    setDeletingId(docId);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ docId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Global Documents</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Visible to all users via RAG search
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
        >
          <RiAddLine className="text-base" />
          Add Document
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)", border: "1px solid rgba(255,80,80,0.2)" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && documents.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <RiGlobalLine className="text-4xl text-white/15" />
          <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
            No global documents yet.
          </p>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
          >
            <RiFileAddLine className="text-base" />
            Add First Document
          </button>
        </div>
      )}

      {/* Document list */}
      {!loading && documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(108,99,255,0.15)" }}
            >
              <RiFileTextLine style={{ color: "#a78bfa" }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                {doc.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: "rgba(26,143,255,0.15)", color: "rgba(100,180,255,0.9)" }}
                >
                  🌐 global
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {timeAgo(doc.created_at)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deletingId === doc.id}
            className="flex-shrink-0 p-2 rounded-lg transition-all text-white/25 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-40"
          >
            {deletingId === doc.id ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <RiDeleteBinLine className="text-base" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setView("list");
    setRefreshKey(k => k + 1);
  };

  if (!token) {
    return <LoginView onLogin={setToken} />;
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="fixed -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "#6c63ff", filter: "blur(100px)", opacity: 0.10 }} />
      <div className="fixed -bottom-16 -right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "#1a8fff", filter: "blur(100px)", opacity: 0.10 }} />

      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
          >
            <RiShieldLine className="text-white text-sm" />
          </div>
          <div>
            <span className="text-white font-bold text-sm">OraAI Admin</span>
            <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Global Knowledge Base
            </span>
          </div>
        </div>
        <button
          onClick={() => setToken(null)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {view === "list" ? (
          <DocumentListView
            key={refreshKey}
            token={token}
            onAdd={() => setView("add")}
          />
        ) : (
          <AddDocumentView
            token={token}
            onBack={() => setView("list")}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
}