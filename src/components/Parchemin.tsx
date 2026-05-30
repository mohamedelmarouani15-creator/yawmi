"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

// ── Ornement calligraphique SVG (coin) ────────────────────────
function CornerOrnament({
  flip = false,
  color = "rgba(139,90,20,0.25)",
}: {
  flip?: boolean;
  color?: string;
}) {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      style={{ transform: flip ? "scale(-1,1)" : undefined }}
    >
      {/* Branche principale */}
      <path d="M 4,44 Q 4,4 44,4" fill="none" stroke={color} strokeWidth={1.2} />
      {/* Branche secondaire */}
      <path d="M 4,34 Q 4,14 24,14" fill="none" stroke={color} strokeWidth={0.8} />
      {/* Petite fleur */}
      <circle cx={44} cy={4} r={3} fill="none" stroke={color} strokeWidth={1} />
      <circle cx={44} cy={4} r={1.2} fill={color} />
      <circle cx={24} cy={14} r={2} fill="none" stroke={color} strokeWidth={0.8} />
      <circle cx={24} cy={14} r={0.9} fill={color} />
      {/* Feuilles */}
      <path d="M 14,24 Q 8,20 12,16 Q 16,20 14,24 Z" fill={color} opacity={0.6} />
      <path d="M 34,10 Q 38,6 40,10 Q 36,14 34,10 Z" fill={color} opacity={0.6} />
    </svg>
  );
}

// ── Icône parchemin SVG ────────────────────────────────────────
function ScrollIcon({ color = "#D4AF37" }: { color?: string }) {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <rect x={5} y={6} width={18} height={17} rx={2}
        fill={color} opacity={0.15} stroke={color} strokeWidth={1.2} />
      <rect x={5} y={6} width={18} height={4} rx={2}
        fill={color} opacity={0.4} />
      <rect x={5} y={19} width={18} height={4} rx={2}
        fill={color} opacity={0.4} />
      {/* Lignes de texte */}
      {[11, 14, 17].map(y => (
        <line key={y} x1={9} y1={y} x2={19} y2={y}
          stroke={color} strokeWidth={0.9} opacity={0.5} />
      ))}
      {/* Effet roulé haut */}
      <ellipse cx={14} cy={6} rx={9} ry={2.5}
        fill={color} opacity={0.3} />
      {/* Effet roulé bas */}
      <ellipse cx={14} cy={23} rx={9} ry={2.5}
        fill={color} opacity={0.3} />
    </svg>
  );
}

// ── Bulle de message ──────────────────────────────────────────
function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          background: isUser
            ? "rgba(5,92,63,0.75)"
            : "rgba(255,255,255,0.12)",
          color: isUser ? "#F8F4EC" : "#2C1A0A",
          fontFamily: "var(--font-dm-sans)",
          borderTopRightRadius: isUser ? 4 : undefined,
          borderTopLeftRadius: isUser ? undefined : 4,
          boxShadow: isUser
            ? "0 1px 4px rgba(0,0,0,0.15)"
            : "0 1px 3px rgba(139,90,20,0.12)",
        }}
      >
        {content}
      </div>
    </motion.div>
  );
}

// ── Indicateur de frappe ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-center gap-1 rounded-2xl px-3.5 py-3"
        style={{ background: "rgba(255,255,255,0.12)", borderTopLeftRadius: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 5, height: 5, background: "rgba(139,90,20,0.5)" }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────
export interface ParcheminMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  // Pour l'instant : pas encore connecté à Gemini
  // Ces props seront remplies en tâche 23
  onSend?: (message: string) => Promise<string>;
  initialMessages?: ParcheminMessage[];
}

// ── Composant principal ────────────────────────────────────────
export default function Parchemin({ onSend, initialMessages = [] }: Props) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<ParcheminMessage[]>(initialMessages);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 500);
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const reply = onSend
        ? await onSend(text)
        : "Je suis en cours de connexion… reviens dans un instant.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Je rencontre une difficulté. Réessaie dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, onSend]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const open  = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      {/* ── Icône flottante ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="scroll-icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: 88,      // au-dessus de la BottomNav
              right: 18,
              zIndex: 45,
            }}
          >
            {/* Lueur pulsante */}
            <motion.div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
              animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Bouton flottant */}
            <motion.button
              onClick={open}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.92 }}
              className="relative flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(30,20,5,0.97) 0%, rgba(20,14,3,0.97) 100%)",
                border: "1.5px solid rgba(212,175,55,0.5)",
                boxShadow:
                  "0 4px 20px rgba(212,175,55,0.2), 0 2px 8px rgba(0,0,0,0.4)",
              }}
              aria-label="Ouvrir le Compagnon"
            >
              <ScrollIcon />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Parchemin déroulé ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay semi-transparent */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 46,
              }}
            />

            {/* Panneau parchemin */}
            <motion.div
              key="parchemin"
              initial={{ scaleY: 0, opacity: 0.5 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{
                scaleY: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2 },
              }}
              style={{
                position: "fixed",
                bottom: 80,   // juste au-dessus de la BottomNav
                left: 12,
                right: 12,
                maxWidth: 480,
                margin: "0 auto",
                height: "min(70vh, 560px)",
                transformOrigin: "bottom center",
                zIndex: 47,
                borderRadius: 20,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                // Texture papier ancien
                background:
                  "radial-gradient(ellipse at 15% 10%, rgba(255,248,228,0.95) 0%, transparent 50%), " +
                  "radial-gradient(ellipse at 85% 90%, rgba(180,130,40,0.15) 0%, transparent 50%), " +
                  "linear-gradient(160deg, #F7EBCB 0%, #EDD89E 30%, #E8CC80 60%, #DDB95C 100%)",
                boxShadow:
                  "0 -8px 40px rgba(212,175,55,0.25), 0 4px 30px rgba(0,0,0,0.35), " +
                  "inset 0 1px 0 rgba(255,255,255,0.4)",
                border: "1px solid rgba(139,90,20,0.35)",
              }}
            >
              {/* ─── Bord supérieur roulé ─── */}
              <div
                style={{
                  height: 16,
                  background:
                    "linear-gradient(180deg, rgba(139,90,20,0.3) 0%, rgba(212,175,55,0.15) 100%)",
                  borderBottom: "1px solid rgba(139,90,20,0.2)",
                  flexShrink: 0,
                }}
              />

              {/* ─── Header ─── */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  borderBottom: "1px solid rgba(139,90,20,0.15)",
                  flexShrink: 0,
                }}
              >
                {/* Ornement coin gauche */}
                <div style={{ position: "absolute", top: 16, left: 0, pointerEvents: "none" }}>
                  <CornerOrnament />
                </div>
                {/* Ornement coin droit */}
                <div style={{ position: "absolute", top: 16, right: 0, pointerEvents: "none" }}>
                  <CornerOrnament flip />
                </div>

                <div className="flex items-center gap-2.5">
                  <ScrollIcon color="rgba(139,90,20,0.7)" />
                  <div>
                    <p
                      className="text-sm font-bold leading-tight"
                      style={{
                        color: "#5C3A0A",
                        fontFamily: "var(--font-bricolage)",
                      }}
                    >
                      Le Compagnon
                    </p>
                    <p
                      className="text-[10px] leading-none opacity-60"
                      style={{ color: "#5C3A0A", fontFamily: "var(--font-amiri)" }}
                    >
                      رفيق العلم
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={close}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(139,90,20,0.08)",
                    border: "1px solid rgba(139,90,20,0.15)",
                    color: "rgba(92,58,10,0.6)",
                  }}
                  aria-label="Fermer"
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* ─── Zone messages ─── */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Message de bienvenue si vide */}
                {messages.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-center py-6"
                  >
                    <p
                      className="text-2xl mb-2"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      ✦
                    </p>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{
                        color: "#5C3A0A",
                        fontFamily: "var(--font-bricolage)",
                      }}
                    >
                      Bienvenue dans le parchemin
                    </p>
                    <p
                      className="text-xs leading-relaxed opacity-60"
                      style={{ color: "#5C3A0A", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Pose-moi une question sur l&apos;arabe, le Coran,{" "}
                      la religion ou l&apos;histoire islamique.
                    </p>
                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {[
                        "Apprends-moi une lettre arabe",
                        "Explique-moi Al-Fatiha",
                        "C'est quoi le ihsan ?",
                      ].map(s => (
                        <motion.button
                          key={s}
                          onClick={() => setInput(s)}
                          whileTap={{ scale: 0.96 }}
                          className="rounded-full px-3 py-1.5 text-xs font-medium"
                          style={{
                            background: "rgba(139,90,20,0.08)",
                            border: "1px solid rgba(139,90,20,0.18)",
                            color: "rgba(92,58,10,0.75)",
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role} content={msg.content} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── Input ─── */}
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{
                  borderTop: "1px solid rgba(139,90,20,0.15)",
                  background: "rgba(255,255,255,0.25)",
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Pose ta question…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{
                    color: "#3A2008",
                    fontFamily: "var(--font-dm-sans)",
                    caretColor: "#8B5A14",
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  whileTap={input.trim() && !loading ? { scale: 0.9 } : {}}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      input.trim() && !loading
                        ? "linear-gradient(135deg,#8B5A14,#5C3A0A)"
                        : "rgba(139,90,20,0.12)",
                    color:
                      input.trim() && !loading
                        ? "#F7EBCB"
                        : "rgba(92,58,10,0.3)",
                  }}
                  aria-label="Envoyer"
                >
                  <Send size={14} />
                </motion.button>
              </div>

              {/* ─── Bord inférieur roulé ─── */}
              <div
                style={{
                  height: 14,
                  background:
                    "linear-gradient(0deg, rgba(139,90,20,0.3) 0%, rgba(212,175,55,0.1) 100%)",
                  borderTop: "1px solid rgba(139,90,20,0.2)",
                  flexShrink: 0,
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
