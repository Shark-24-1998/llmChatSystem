"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {

        const res = await fetch("/api/chats");

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