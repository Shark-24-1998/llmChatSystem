"use client";

export default function StreamingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex items-end gap-[3px]" style={{ height: "18px" }}>
        {[10, 16, 12, 8].map((h, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: "3px",
              height: `${h}px`,
              borderRadius: "9999px",
              background: "linear-gradient(180deg, #6c63ff, #1a8fff)",
              transformOrigin: "bottom",
              animation: `soundbar 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <span
        className="text-xs font-medium tracking-wide"
        style={{
          background: "linear-gradient(135deg, #6c63ff, #1a8fff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        thinking...
      </span>

      {/* 🔥 inline keyframes — no dependency on globals.css */}
      <style>{`
        @keyframes soundbar {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}