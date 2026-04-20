"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ className, children, ...props }) {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // inline code
  if (!match) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-[#a78bfa] font-mono text-[12px]"
        style={{ background: "rgba(108,99,255,0.15)" }}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div
      className="relative my-3 rounded-xl overflow-hidden border border-white/10"
      style={{ background: "#1a1a2e" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-white/10"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <span className="text-[11px] text-white/40 font-mono">{match[1]}</span>
        <button
          onClick={handleCopy}
          className="text-[11px] transition-all flex items-center gap-1"
          style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.4)" }}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="#4ade80"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              copied!
            </>
          ) : (
            "copy"
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",  // 🔥 transparent so #1a1a2e shows through
          padding: "1rem",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            background: "transparent",
            fontFamily: "var(--font-geist-mono, monospace)",
          },
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}