"use client";

import { useState, useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";
import { RiRobot2Line } from "react-icons/ri";
import { IoCloseSharp } from "react-icons/io5";
import Image from "next/image";
import StreamingIndicator from "./StreamingIndicator";
import CodeBlock from "./CodeBlock";

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




export default function ChatWindow({ chatId, setActiveChat, refreshChats }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);
  const accumulatorRef = useRef("");
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const isStreamingRef = useRef(false);


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

  // 🔥 throttled smooth scroll — not on every single token
  useEffect(() => {
    if (!isStreamingRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // scroll to bottom when streaming ends
  useEffect(() => {
    if (!isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isStreaming]);


  useEffect(() => {
    const handler = (e) => setLightboxUrl(e.detail);
    window.addEventListener("openLightbox", handler);
    return () => window.removeEventListener("openLightbox", handler);
  }, []);

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

    const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;

    setMessages((prev) => [...prev,
    { role: "user", content: text, imageUrl: previewUrl },
    { role: "assistant", content: "" }  // 🔥 add BEFORE fetch so indicator shows immediately
    ]);
    setIsStreaming(true);
    isStreamingRef.current = true;

    const formData = new FormData();
    formData.append("prompt", text);
    formData.append("chatId", currentChatId);
    if (imageFile) formData.append("image", imageFile);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    accumulatorRef.current = "";

    // 🔥 REMOVED: setMessages for empty assistant — already added above

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      accumulatorRef.current = accumulatorRef.current + chunk;

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: accumulatorRef.current };
        return copy;
      });
    }
    setIsStreaming(false);
    isStreamingRef.current = false;
  };


  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full min-h-0 overflow-hidden">

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
         <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={"flex gap-3 " + (m.role === "user" ? "flex-row-reverse" : "")}>
              {m.role === "user" ? <UserAvatar /> : <AIAvatarIcon />}
              <div className={"max-w-[75%] " + (m.role === "user" ? "items-end flex flex-col" : "")}>
                {m.role === "assistant" && m.content === "" ? (
                  <div
                    className="rounded-2xl rounded-tl-sm border border-white/[0.08]"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <StreamingIndicator />
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
                     <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: CodeBlock,
                            p({ children }) {
                              return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                            },
                            ul({ children }) {
                              return <ul className="mb-3 ml-4 space-y-1 list-disc marker:text-white/30">{children}</ul>;
                            },
                            ol({ children }) {
                              return <ol className="mb-3 ml-4 space-y-1 list-decimal marker:text-white/30">{children}</ol>;
                            },
                            h1({ children }) {
                              return <h1 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h1>;
                            },
                            h2({ children }) {
                              return <h2 className="text-base font-semibold text-white mb-2 mt-3">{children}</h2>;
                            },
                            h3({ children }) {
                              return <h3 className="text-sm font-semibold text-white mb-1 mt-2">{children}</h3>;
                            },
                            blockquote({ children }) {
                              return (
                                <blockquote className="border-l-2 border-[#6c63ff] pl-3 my-2 text-white/50 italic">
                                  {children}
                                </blockquote>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {m.imageUrl && (
                          <Image
                            src={m.imageUrl}
                            alt="attached image"
                            width={200}
                            height={200}
                            className="rounded-xl object-cover border border-white/10 cursor-pointer hover:opacity-80 transition-all"
                            unoptimized
                            onClick={() => setLightboxUrl(m.imageUrl)}
                          />
                        )}
                        {m.content && (
                          <span>{m.content}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
          {/* Lightbox */}
          {lightboxUrl && (
            <div
              onClick={() => setLightboxUrl(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
            >
              <div className="relative max-w-3xl max-h-[90vh] w-full px-4">
                <Image
                  src={lightboxUrl}
                  alt="full preview"
                  width={900}
                  height={700}
                  className="rounded-2xl object-contain w-full h-auto border border-white/10"
                  unoptimized
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setLightboxUrl(null)}
                  className="absolute top-2 right-6 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all text-white"
                >
                  <IoCloseSharp />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}