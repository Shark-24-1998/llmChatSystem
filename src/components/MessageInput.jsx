"use client";

import { useState } from "react";
import { IoSendSharp } from "react-icons/io5";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-white/[0.06]">
      <div
        className="flex items-end gap-3 rounded-2xl border border-white/10 px-4 py-3 transition-all focus-within:border-[#6c63ff]/60"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <textarea
          className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none resize-none leading-relaxed max-h-[160px] min-h-[24px]"
          placeholder="Message OraAI..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={handleKey}
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={send}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
        >
          <IoSendSharp className="text-sm" />
        </button>
      </div>
      <p className="text-center text-[11px] text-white/20 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}