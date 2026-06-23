"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import type { AgentMessage } from "@/lib/maison-sagesse/types";

const AGENT_META: Record<
  "directeur" | "manager" | "adjoint",
  { emoji: string; name: string; bg: string; color: string }
> = {
  directeur: {
    emoji: "👑",
    name: "Al-Ma'mûn",
    bg: "rgba(139,92,246,0.18)",
    color: "#a78bfa",
  },
  manager: {
    emoji: "⚗️",
    name: "Al-Khwârizmî",
    bg: "rgba(59,130,246,0.18)",
    color: "#60a5fa",
  },
  adjoint: {
    emoji: "📜",
    name: "Yasmine",
    bg: "rgba(5,92,63,0.25)",
    color: "#34d399",
  },
};

function formatTimestamp(ts: number): string {
  const elapsed = Math.floor((Date.now() - ts) / 1000);
  if (elapsed < 60) return `il y a ${elapsed}s`;
  const mins = Math.floor(elapsed / 60);
  return `il y a ${mins} min`;
}

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const meta = AGENT_META[msg.agentId];

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="flex items-start gap-2"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
        style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
      >
        {meta.emoji}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-dm-sans)",
              color: meta.color,
              fontWeight: 700,
            }}
          >
            {meta.name}
          </span>
          <span
            style={{
              fontSize: 8,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(248,244,236,0.25)",
            }}
          >
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-dm-sans)",
            color: "rgba(248,244,236,0.75)",
            lineHeight: 1.4,
          }}
        >
          {msg.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function AgentPanel() {
  const agentMessages = useMaisonSagesseStore((s) => s.agentMessages);
  const addAgentMessage = useMaisonSagesseStore((s) => s.addAgentMessage);
  const phase = useMaisonSagesseStore((s) => s.phase);
  const enigmaA = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC = useMaisonSagesseStore((s) => s.enigmaC);
  const timeLeft = useMaisonSagesseStore((s) => s.timeLeft);
  const activeAgent = useMaisonSagesseStore((s) => s.activeAgent);

  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

  const visibleMessages = agentMessages.slice(-5);
  const unread = agentMessages.filter((m) => !m.read).length;

  const handleSendHelp = async () => {
    if (!chatInput.trim() || sending) return;
    const question = chatInput.trim();
    const agentId = activeAgent ?? "adjoint";
    setChatInput("");
    setChatOpen(false);
    setSending(true);

    const minutesLeft = Math.floor(timeLeft / 60);
    const context = `Phase actuelle : ${phase}. Temps restant : ${minutesLeft} min. Énigme de la Foi ${enigmaA.solved ? "résolue" : "non résolue"}, Énigme de la Science ${enigmaB.solved ? "résolue" : "non résolue"}, Énigme de la Sagesse ${enigmaC.solved ? "résolue" : "non résolue"}.`;

    try {
      const res = await fetch("/api/maison-sagesse/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: question, context }),
      });
      const data = await res.json();

      if (!res.ok) {
        addAgentMessage({
          agentId: "adjoint",
          text: data.message ?? "L'agent ne répond pas pour l'instant. Réessaie dans un instant.",
          triggerContext: "user_help_request_error",
        });
        return;
      }

      addAgentMessage({
        agentId,
        text: data.message,
        triggerContext: "user_help_request",
      });
    } catch {
      addAgentMessage({
        agentId: "adjoint",
        text: "Le message n'a pas pu être envoyé — vérifie ta connexion et réessaie.",
        triggerContext: "user_help_request_error",
      });
    } finally {
      setSending(false);
    }
  };

  // Only render after game starts
  if (phase === "idle" || phase === "intro") return null;

  return (
    <div
      className="absolute right-4 top-24 z-30 pointer-events-auto"
      style={{ width: 240 }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-2xl"
        style={{
          background: "rgba(10,15,13,0.92)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderBottom: collapsed ? undefined : "none",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12 }}>📡</span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(212,175,55,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 700,
            }}
          >
            Agents
          </span>
          {unread > 0 && (
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold"
              style={{ background: "#ef4444", color: "white" }}
            >
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            color: "rgba(212,175,55,0.5)",
            fontSize: 10,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
          }}
        >
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {/* Messages panel */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="rounded-b-2xl p-3 flex flex-col gap-2.5"
              style={{
                background: "rgba(10,15,13,0.88)",
                border: "1px solid rgba(212,175,55,0.25)",
                borderTop: "none",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {visibleMessages.length === 0 ? (
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(248,244,236,0.3)",
                    fontFamily: "var(--font-dm-sans)",
                    textAlign: "center",
                    padding: "8px 0",
                  }}
                >
                  Aucun message pour l&apos;instant...
                </p>
              ) : (
                visibleMessages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))
              )}

              {sending && (
                <p
                  style={{
                    fontSize: 9,
                    color: "rgba(52,211,153,0.5)",
                    fontFamily: "var(--font-dm-sans)",
                    textAlign: "center",
                  }}
                >
                  L&apos;agent réfléchit...
                </p>
              )}

              {/* Help button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={sending}
                onClick={() => setChatOpen((o) => !o)}
                className="w-full rounded-xl py-1.5 mt-1"
                style={{
                  background: "rgba(5,92,63,0.15)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399",
                  fontSize: 10,
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                📜 Demander de l&apos;aide
              </motion.button>

              {/* Mini chat */}
              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-1.5 mt-1"
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendHelp()}
                      placeholder="Votre question..."
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(52,211,153,0.2)",
                        color: "rgba(248,244,236,0.8)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    />
                    <button
                      onClick={handleSendHelp}
                      className="rounded-lg px-2 py-1.5 text-xs font-bold"
                      style={{
                        background: "rgba(52,211,153,0.2)",
                        color: "#34d399",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
