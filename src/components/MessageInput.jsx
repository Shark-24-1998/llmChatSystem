"use client";

import { useState, useRef } from "react";
import { IoSendSharp } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import Image from "next/image";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    fileInputRef.current.value = "";
  };

  const send = () => {
    if ((!text.trim() && !imageFile) || disabled) return;
    onSend(text, imageFile);  // 🔥 pass imageFile up to ChatWindow
    setText("");
    removeImage();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-white/[0.06]">

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <Image
            src={imagePreview}
            alt="preview"
            width={64}
            height={64}
            className="object-cover rounded-xl border border-white/10"
            unoptimized
          />
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all"
          >
            <IoCloseSharp className="text-white text-[10px]" />
          </button>
        </div>
      )}

      <div
        className="flex items-end gap-3 rounded-2xl border border-white/10 px-4 py-3 transition-all focus-within:border-[#6c63ff]/60"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {/* 🔥 Image attach button */}
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={disabled}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <IoImageOutline className="text-lg" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

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
          disabled={(!text.trim() && !imageFile) || disabled}
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