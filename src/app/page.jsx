import Link from "next/link";
import {
  IoChatbubblesOutline,
  IoFlashOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoCodeSlashOutline,
  IoArrowForward,
  IoPlayCircleOutline,
} from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";

const stats = [
  { num: "2M+", label: "Messages sent" },
  { num: "98%", label: "Satisfaction rate" },
  { num: "0.3s", label: "Avg. response time" },
  { num: "50+", label: "Languages" },
];

const msgs = [
  { role: "ai",   text: "Hello! I am OraAI. Ask me anything — code, ideas, analysis, or just a conversation." },
  { role: "user", text: "Can you help me write a product launch email?" },
  { role: "ai",   text: "Absolutely! Tell me about your product and I will craft a compelling email that converts." },
];

function AIAvatar() {
  return (
    <span
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
      style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
    >
      <RiRobot2Line />
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white/10 text-white/70">
      U
    </span>
  );
}

function AIBubble({ text }) {
  return (
    <p className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed max-w-[80%] bg-white/[0.06] text-white/80 border border-white/[0.08]">
      {text}
    </p>
  );
}

function UserBubble({ text }) {
  return (
    <p
      className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed max-w-[80%] text-white"
      style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
    >
      {text}
    </p>
  );
}

function FeatureCard({ icon, accentClass, title, desc, wide }) {
  return (
    <div
      className={"rounded-2xl p-7 border border-white/[0.08] hover:-translate-y-1 transition-all duration-200 " + (wide ? "md:col-span-2 " : "")}
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className={"w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 " + accentClass}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="text-white overflow-x-hidden min-h-screen"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)" }}
    >

      {/* Ambient orbs — identical to login page */}
      <div
        className="fixed -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "#6c63ff", filter: "blur(100px)", opacity: 0.12 }}
      />
      <div
        className="fixed -bottom-16 -right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "#1a8fff", filter: "blur(100px)", opacity: 0.12 }}
      />

      {/* HERO */}
      <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20 pb-16">

        {/* Logo */}
        <div className="mb-5">
          <svg width="52" height="52" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#lg1)" />
            <path d="M10 13c0-1.1.9-2 2-2h6a6 6 0 0 1 0 12h-2v4l-4-4H12a2 2 0 0 1-2-2V13z" fill="white" fillOpacity="0.9" />
            <circle cx="24" cy="13" r="4" fill="white" fillOpacity="0.5" />
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6c63ff" />
                <stop offset="1" stopColor="#1a8fff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-xl font-extrabold tracking-tight mb-8 text-white">
          Ora<span style={{ color: "#a78bfa" }}>AI</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/50 mb-10 border border-white/10 bg-white/[0.04]">
          <HiSparkles style={{ color: "#a78bfa" }} />
          Now in open beta · 50k+ conversations daily
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] tracking-[-2px] max-w-[860px] mb-7 font-bold">
          Think it.{" "}
          <span style={{ fontStyle: "italic", color: "#a78bfa" }}>Say it.</span>
          <span className="block" style={{ color: "#60b4ff" }}>
            Get answers.
          </span>
        </h1>

        <p className="text-[clamp(15px,2vw,18px)] text-white/40 max-w-[460px] leading-relaxed mb-10 font-light">
          OraAI is the intelligent chat companion that understands context,
          remembers your preferences, and delivers precise answers instantly.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-full text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)", boxShadow: "0 2px 20px rgba(108,99,255,0.4)" }}
          >
            Start chatting free
            <IoArrowForward />
          </Link>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full text-base font-medium text-white/60 border border-white/10 hover:border-white/25 transition-colors bg-white/[0.04]"
          >
            <IoPlayCircleOutline className="text-lg" />
            Watch demo
          </a>
        </div>

        {/* Chat preview — glassmorphism card matching login */}
        <div
          className="w-full max-w-[600px] rounded-3xl p-6 text-left border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
            >
              <RiRobot2Line className="text-base" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">OraAI Assistant</p>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online now
              </p>
            </div>
          </div>

          {msgs.map((m, i) => (
            <div key={i} className={"flex gap-2.5 mb-3 " + (m.role === "user" ? "flex-row-reverse" : "")}>
              {m.role === "ai" ? <AIAvatar /> : <UserAvatar />}
              {m.role === "ai" ? <AIBubble text={m.text} /> : <UserBubble text={m.text} />}
            </div>
          ))}

          <div className="flex gap-2.5 opacity-50">
            <span
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
              style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)" }}
            >
              <RiRobot2Line />
            </span>
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-white/[0.06] mx-6 md:mx-10">
        {stats.map((s, i) => (
          <div key={i} className="px-8 py-10 border-r border-white/[0.06] last:border-r-0">
            <div className="text-4xl font-bold tracking-tight leading-none mb-1" style={{ color: "#a78bfa" }}>
              {s.num}
            </div>
            <div className="text-sm text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-24">
        <p className="text-xs font-bold tracking-[3px] uppercase mb-4" style={{ color: "#a78bfa" }}>
          Features
        </p>
        <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight tracking-tight mb-12 text-white">
          Everything you need in one place
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            wide={true}
            icon={<IoChatbubblesOutline />}
            accentClass="bg-[#6c63ff]/20 text-[#a78bfa]"
            title="Context-aware conversations"
            desc="OraAI tracks the full thread of your conversation, maintaining context across hundreds of messages so you never have to repeat yourself."
          />
          <FeatureCard
            wide={false}
            icon={<IoFlashOutline />}
            accentClass="bg-[#1a8fff]/20 text-[#60b4ff]"
            title="Blazing fast"
            desc="Responses in under 300ms so the conversation flows as naturally as thought."
          />
          <FeatureCard
            wide={false}
            icon={<IoGlobeOutline />}
            accentClass="bg-green-500/20 text-green-400"
            title="Multilingual"
            desc="Chat in 50+ languages with native-level fluency and auto-detection."
          />
          <FeatureCard
            wide={false}
            icon={<IoShieldCheckmarkOutline />}
            accentClass="bg-[#6c63ff]/20 text-[#a78bfa]"
            title="Private and secure"
            desc="End-to-end encryption keeps your conversations completely private."
          />
          <FeatureCard
            wide={true}
            icon={<IoCodeSlashOutline />}
            accentClass="bg-[#1a8fff]/20 text-[#60b4ff]"
            title="Code generation"
            desc="Write, debug, and refactor code across 40+ languages with real-time explanations and intelligent suggestions."
          />
        </div>
      </div>

      {/* CTA STRIP */}
      <div
        className="mx-6 md:mx-10 mb-20 rounded-[24px] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
        style={{ background: "rgba(108,99,255,0.10)", backdropFilter: "blur(12px)" }}
      >
        <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-white leading-tight tracking-tight text-center md:text-left">
          Ready to experience{" "}
          <span style={{ fontStyle: "italic", color: "#a78bfa" }}>AI that gets you?</span>
        </h2>
        <Link
          href="/login"
          className="flex-shrink-0 inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-full text-base font-bold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #6c63ff, #1a8fff)", boxShadow: "0 2px 20px rgba(108,99,255,0.4)" }}
        >
          Start for free
          <IoArrowForward />
        </Link>
      </div>

    </div>
  );
}