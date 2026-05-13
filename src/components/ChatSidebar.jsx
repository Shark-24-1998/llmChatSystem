"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RiRobot2Line, RiAddLine, RiChat3Line,
  RiFileTextLine, RiUploadLine,
  RiArrowLeftLine, RiFileAddLine
} from "react-icons/ri";
import { IoTrashOutline } from "react-icons/io5";
import { supabase } from "@/lib/supabase";

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

const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// ─────────────────────────────────────────
// ADD DOCUMENT VIEW
// ─────────────────────────────────────────
function AddDocumentView({ onBack, onSaved }) {
  const [mode, setMode] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPdfFile(null);
    setError(null);
    setSuccess(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB");
      return;
    }
    setPdfFile(file);
    setError(null);
    if (!title.trim()) {
      setTitle(file.name.replace(".pdf", "").replace(/_/g, " ").replace(/-/g, " "));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Title cannot be empty"); return; }
    if (mode === "text" && !content.trim()) { setError("Content cannot be empty"); return; }
    if (mode === "pdf" && !pdfFile) { setError("Please select a PDF file"); return; }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      let res;

      if (mode === "text") {
        res = await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: title.trim(), content: content.trim() }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("title", title.trim());
        res = await fetch("/api/documents/pdf", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setSuccess(true);
      resetForm();
      setTimeout(() => {
        setSuccess(false);
        onSaved();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-white/[0.06]">
        <button
          onClick={onBack}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <RiArrowLeftLine className="text-base" />
        </button>
        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
          Add Document
        </span>
      </div>

      <div className="flex flex-col gap-3 px-3 py-3 flex-1 overflow-y-auto">

        {/* Mode toggle */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => handleModeSwitch("text")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: mode === "text" ? "rgba(108,99,255,0.25)" : "transparent",
              color: mode === "text" ? "#a78bfa" : "rgba(255,255,255,0.35)",
            }}
          >
            <RiFileTextLine className="text-sm" />
            Text
          </button>
          <button
            onClick={() => handleModeSwitch("pdf")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: mode === "pdf" ? "rgba(108,99,255,0.25)" : "transparent",
              color: mode === "pdf" ? "#a78bfa" : "rgba(255,255,255,0.35)",
            }}
          >
            <RiUploadLine className="text-sm" />
            PDF
          </button>
        </div>

        {/* Info banner */}
        <div
          className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
          style={{ background: "rgba(108,99,255,0.12)", color: "rgba(167,139,250,0.9)", border: "1px solid rgba(108,99,255,0.2)" }}
        >
          {mode === "text"
            ? "Paste any text — your AI will use it to answer your questions."
            : "Upload a PDF — text will be extracted and indexed automatically."}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
            TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(null); }}
            placeholder="e.g. My Offer Letter"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </div>

        {/* Text mode */}
        {mode === "text" && (
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                CONTENT
              </label>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                {content.length} chars
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(null); }}
              placeholder="Paste your document content here..."
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none transition-all leading-relaxed"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
        )}

        {/* PDF mode */}
        {mode === "pdf" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
              PDF FILE
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 px-3 py-8 rounded-xl cursor-pointer transition-all"
              style={{
                background: pdfFile ? "rgba(108,99,255,0.08)" : "rgba(255,255,255,0.03)",
                border: pdfFile ? "1px dashed rgba(108,99,255,0.4)" : "1px dashed rgba(255,255,255,0.12)",
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              {pdfFile ? (
                <>
                  <RiFileTextLine className="text-2xl" style={{ color: "#a78bfa" }} />
                  <span className="text-xs font-medium text-center" style={{ color: "rgba(167,139,250,0.9)" }}>
                    {pdfFile.name}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {(pdfFile.size / 1024).toFixed(1)} KB · click to change
                  </span>
                </>
              ) : (
                <>
                  <RiUploadLine className="text-2xl text-white/20" />
                  <span className="text-xs text-white/30 text-center">
                    Click to upload PDF
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Max 10MB
                  </span>
                </>
              )}
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs"
            style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)", border: "1px solid rgba(255,80,80,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs"
            style={{ background: "rgba(50,200,120,0.1)", color: "rgba(80,220,140,0.9)", border: "1px solid rgba(50,200,120,0.2)" }}
          >
            ✓ Document saved and indexed successfully
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading || !title.trim() || (mode === "text" && !content.trim()) || (mode === "pdf" && !pdfFile)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === "pdf" ? "Extracting & indexing..." : "Chunking & indexing..."}
            </>
          ) : (
            <>
              <RiUploadLine className="text-base" />
              Save to Knowledge Base
            </>
          )}
        </button>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// DOCUMENT LIST VIEW
// ─────────────────────────────────────────
function DocumentListView({ onAdd }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this document and all its chunks?")) return;

    setDeletingId(docId);
    try {
      const token = await getToken();
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
          MY DOCUMENTS
        </span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
        >
          <RiAddLine className="text-sm" />
          Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-5 h-5 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Loading documents...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs"
            style={{ background: "rgba(255,80,80,0.1)", color: "rgba(255,120,120,0.9)", border: "1px solid rgba(255,80,80,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RiFileTextLine className="text-3xl text-white/20" />
            <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
              No documents yet.{"\n"}Add your first document.
            </p>
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
            >
              <RiFileAddLine className="text-sm" />
              Add Document
            </button>
          </div>
        )}

        {/* Document list */}
        {!loading && documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-start justify-between gap-2 px-3 py-3 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)"
            }}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <RiFileTextLine
                className="text-base flex-shrink-0 mt-0.5"
                style={{ color: "#a78bfa" }}
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {doc.title}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {timeAgo(doc.created_at)}
                </span>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => handleDelete(doc.id, e)}
              disabled={deletingId === doc.id}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 transition-all text-white/25 hover:text-red-400 disabled:opacity-40"
            >
              {deletingId === doc.id ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <IoTrashOutline className="text-sm" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// DOCS PANEL (orchestrates views)
// ─────────────────────────────────────────
function DocumentPanel() {
  const [view, setView] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setView("list");
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {view === "list" ? (
        <DocumentListView
          key={refreshKey}
          onAdd={() => setView("add")}
        />
      ) : (
        <AddDocumentView
          onBack={() => setView("list")}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN SIDEBAR
// ─────────────────────────────────────────
export default function ChatSidebar({ chats, setActiveChat, activeChat, onNewChat, onDeleteChat }) {
  const [activeTab, setActiveTab] = useState("chats");

  return (
    <div
      className="flex flex-col h-full w-[260px] flex-shrink-0 border-r border-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="url(#sbGrad)" />
          <path d="M10 13c0-1.1.9-2 2-2h6a6 6 0 0 1 0 12h-2v4l-4-4H12a2 2 0 0 1-2-2V13z" fill="white" fillOpacity="0.9" />
          <circle cx="24" cy="13" r="4" fill="white" fillOpacity="0.5" />
          <defs>
            <linearGradient id="sbGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6c63ff" />
              <stop offset="1" stopColor="#1a8fff" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-white font-extrabold text-base tracking-tight">
          Ora<span style={{ color: "#a78bfa" }}>AI</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-3 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab("chats")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: activeTab === "chats" ? "rgba(108,99,255,0.2)" : "transparent",
            color: activeTab === "chats" ? "#a78bfa" : "rgba(255,255,255,0.35)",
            border: activeTab === "chats" ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent",
          }}
        >
          <RiChat3Line className="text-sm" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: activeTab === "docs" ? "rgba(108,99,255,0.2)" : "transparent",
            color: activeTab === "docs" ? "#a78bfa" : "rgba(255,255,255,0.35)",
            border: activeTab === "docs" ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent",
          }}
        >
          <RiFileTextLine className="text-sm" />
          Docs
        </button>
      </div>

      {/* Content */}
      {activeTab === "chats" ? (
        <>
          <div className="px-3 py-3">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
            >
              <RiAddLine className="text-base flex-shrink-0" />
              New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
            {chats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <RiChat3Line className="text-3xl text-white/20" />
                <p className="text-xs text-white/25 text-center leading-relaxed">
                  No chats yet.{"\n"}Start a new conversation.
                </p>
              </div>
            )}
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={
                  "group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all " +
                  (activeChat === chat.id
                    ? "bg-white/10 border border-white/[0.10]"
                    : "hover:bg-white/[0.05] border border-transparent")
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <RiChat3Line
                    className="text-sm flex-shrink-0"
                    style={{ color: activeChat === chat.id ? "#a78bfa" : "rgba(255,255,255,0.35)" }}
                  />
                  <span
                    className="text-sm truncate"
                    style={{ color: activeChat === chat.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                  >
                    {chat.title || "Untitled chat"}
                  </span>
                </div>
                {onDeleteChat && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <IoTrashOutline className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <DocumentPanel />
      )}

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
          >
            <RiRobot2Line />
          </div>
          <span className="text-xs text-white/35 truncate">AI Chat System</span>
        </div>
      </div>
    </div>
  );
}