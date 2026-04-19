"use client";

import { useState, useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";
import { RiRobot2Line } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi2";

function UserAvatar() {
  return (
    <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white/10 text-white/70 mt-0.5">
      U
    </span>
  );
}

function AIAvatarIcon() {
  return (
    <span
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs mt-0.5"
      style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
    >
      <RiRobot2Line />
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3.5 py-3">
      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
    </div>
  );
}

export default function ChatWindow({ chatId, setActiveChat, refreshChats }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) { setMessages([]); return; }
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/messages?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createChat = async (prompt) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    const chat = await res.json();
    setActiveChat(chat.id);
    await refreshChats();
    return chat.id;
  };

const sendMessage = async (text, imageFile = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let currentChatId = chatId;
    if (!currentChatId) currentChatId = await createChat(text);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsStreaming(true);

    const formData = new FormData();
    formData.append("prompt", text);
    formData.append("chatId", currentChatId);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 🔥 FIX: useRef-style accumulator to avoid ESLint immutability warning
    let accumulated = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      accumulated = accumulated + chunk;  // 🔥 reassign instead of +=

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: accumulated };
        return copy;
      });
    }
    setIsStreaming(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">

      {/* Empty state */}
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-5"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
          >
            <RiRobot2Line />
          </div>
          <h2 className="text-white text-xl font-bold mb-2 tracking-tight">How can I help you?</h2>
          <p className="text-white/35 text-sm max-w-xs leading-relaxed">
            Ask me anything — code, writing, analysis, or just a conversation.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-8 w-full max-w-sm">
            {[
              "Explain quantum computing",
              "Write a Python script",
              "Summarise a topic",
              "Debug my code",
            ].map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left px-3.5 py-3 rounded-xl text-xs text-white/50 border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all bg-white/[0.03]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {!isEmpty && (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={"flex gap-3 " + (m.role === "user" ? "flex-row-reverse" : "")}>
              {m.role === "user" ? <UserAvatar /> : <AIAvatarIcon />}
              <div className={"max-w-[75%] " + (m.role === "user" ? "items-end flex flex-col" : "")}>
                {m.role === "assistant" && m.content === "" && isStreaming ? (
                  <div
                    className="rounded-2xl rounded-tl-sm border border-white/[0.08]"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <TypingDots />
                  </div>
                ) : (
                  <div
                    className={
                      "text-sm leading-relaxed rounded-2xl px-4 py-3 " +
                      (m.role === "user"
                        ? "text-white rounded-tr-sm"
                        : "text-white/85 rounded-tl-sm border border-white/[0.08]")
                    }
                    style={
                      m.role === "user"
                        ? { background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }
                        : { background: "rgba(255,255,255,0.05)" }
                    }
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/10 prose-pre:border prose-pre:border-white/10 prose-code:text-[#a78bfa] prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-headings:text-white prose-strong:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}