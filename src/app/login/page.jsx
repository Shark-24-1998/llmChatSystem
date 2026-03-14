"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { MdEmail, MdLock, MdLayers } from "react-icons/md"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [message, setMessage] = useState("")

  const signup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : "Check your email to confirm signup!")
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
  }

  const google = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#6c63ff] rounded-full blur-[100px] opacity-15 pointer-events-none" />
      <div className="absolute -bottom-16 -right-10 w-72 h-72 bg-[#1a8fff] rounded-full blur-[100px] opacity-15 pointer-events-none" />

      <div className="relative w-full max-w-[420px] bg-white/[0.04] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#1a8fff] flex items-center justify-center">
            <MdLayers className="text-white text-xl" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Nexus
          </span>
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
        <p className="text-white/40 text-sm mb-7 font-light">Sign in to continue to your workspace</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-7">
          {["login", "signup"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setMessage("") }}
              className={`flex-1 py-2.5 rounded-[9px] text-sm font-medium transition-all duration-200 ${
                mode === tab
                  ? "bg-[#6c63ff]/85 text-white shadow-[0_2px_12px_rgba(108,99,255,0.4)]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm text-center">
            {message}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-white/45 uppercase tracking-widest mb-1.5">Email</label>
          <div className="relative flex items-center">
            <MdEmail className="absolute left-3.5 text-white/30 text-base pointer-events-none" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-[11px] font-medium text-white/45 uppercase tracking-widest mb-1.5">Password</label>
          <div className="relative flex items-center">
            <MdLock className="absolute left-3.5 text-white/30 text-base pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Primary Button */}
        <button
          onClick={mode === "login" ? login : signup}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#1a8fff] text-white text-sm font-semibold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 text-white/20 text-xs">
          <span className="flex-1 h-px bg-white/10" />
          or continue with
          <span className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Button */}
        <button
          onClick={google}
          className="w-full py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white/75 text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all"
        >
          <FcGoogle className="text-lg" />
          Continue with Google
        </button>

        <p className="text-center mt-5 text-xs text-white/30">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage("") }}
            className="text-[#6c63ff] font-medium hover:opacity-80"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}