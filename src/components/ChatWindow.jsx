"use client";

import { useState, useEffect } from "react";
import MessageInput from "./MessageInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatWindow({ chatId, setActiveChat }) {

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (chatId) {
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const loadMessages = async () => {

        const res = await fetch(`/api/messages?chatId=${chatId}`);
        const data = await res.json();

        setMessages(data);

    };

    const createChat = async (prompt) => {

        const res = await fetch("/api/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt
            })
        });

        const chat = await res.json();

        setActiveChat(chat.id);

        await refreshChats();

        return chat.id;

    };
    const sendMessage = async (text) => {

        let currentChatId = chatId;

        if (!currentChatId) {
            currentChatId = await createChat(text);
        }

        const userMsg = { role: "user", content: text };

        setMessages(prev => [...prev, userMsg]);

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: text,
                chatId: currentChatId
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantText = "";

        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {

            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);

            assistantText += chunk;

            setMessages(prev => {

                const copy = [...prev];
                copy[copy.length - 1].content = assistantText;
                return copy;

            });

        }

    };

    return (

        <div style={{ flex: 1, padding: 20 }}>

            <div style={{ minHeight: 500 }}>

                {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: 20 }}>
                        <b>{m.role}</b>

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                        </ReactMarkdown>
                    </div>
                ))}

            </div>

            <MessageInput onSend={sendMessage} />

        </div>

    );

}