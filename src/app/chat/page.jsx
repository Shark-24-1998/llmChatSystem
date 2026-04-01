"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useRouter } from "next/navigation";

export default function ChatPage() {

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            await loadChats(); // only after session confirmed
        };

        init();
    }, []);

    const loadChats = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.error("No session");
            return;
        }

        const res = await fetch("/api/chats", {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (!res.ok) {
            console.error("Failed to load chats");
            return;
        }

        const data = await res.json();
        setChats(data);

        if (data.length > 0) {
            setActiveChat(data[0].id);
        }
    };

    return (

        <div style={{ display: "flex", height: "100vh" }}>

            <ChatSidebar
                chats={chats}
                setActiveChat={setActiveChat}
            />

            <ChatWindow
                chatId={activeChat}
                setActiveChat={setActiveChat}
                refreshChats={loadChats}
            />
        </div>

    );

}