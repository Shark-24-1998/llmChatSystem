"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useRouter } from "next/navigation";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const loadChats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { console.error("No session"); return; }
    const res = await fetch("/api/chats", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) { console.error("Failed to load chats"); return; }
    const data = await res.json();
    setChats(data);
    if (data.length > 0 && !activeChat) setActiveChat(data[0].id);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      await loadChats();
    };
    init();
  }, [router]);

  const handleNewChat = () => {
    setActiveChat(null);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/chats", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ chatId }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to delete chat:", data);
      return;
    }

    // if deleted chat was active → reset to first remaining chat
    setChats(prev => {
      const updated = prev.filter(c => c.id !== chatId);
      if (activeChat === chatId) {
        setActiveChat(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };


  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)" }}
    >
      {/* Ambient orbs */}
      <div
        className="fixed -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "#6c63ff", filter: "blur(100px)", opacity: 0.10 }}
      />
      <div
        className="fixed -bottom-16 -right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "#1a8fff", filter: "blur(100px)", opacity: 0.10 }}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          "fixed md:relative z-30 md:z-auto h-full transition-transform duration-300 md:translate-x-0 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          setActiveChat={(id) => { setActiveChat(id); setSidebarOpen(false); }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <RiMenuLine className="text-xl" />
          </button>
          <span className="text-white font-bold text-base tracking-tight">
            Ora<span style={{ color: "#a78bfa" }}>AI</span>
          </span>
        </div>

        <ChatWindow
          chatId={activeChat}
          setActiveChat={setActiveChat}
          refreshChats={loadChats}
        />
      </div>
    </div>
  );
}