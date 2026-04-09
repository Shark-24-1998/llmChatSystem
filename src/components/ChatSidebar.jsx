"use client";

import { RiRobot2Line, RiAddLine, RiChat3Line } from "react-icons/ri";
import { IoTrashOutline } from "react-icons/io5";

export default function ChatSidebar({ chats, setActiveChat, activeChat, onNewChat, onDeleteChat }) {
  return (
    <div
      className="flex flex-col h-full w-[260px] flex-shrink-0 border-r border-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {/* Logo header */}
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

      {/* New chat button */}
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

      {/* Chat list */}
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

      {/* Bottom user info placeholder */}
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