"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Volume2, VolumeX, Smartphone, SmartphoneNfc, Eye, Zap, Wind, GraduationCap } from "lucide-react";
import type { EscapeSettings } from "@/lib/escape3d/escape-settings";

interface Props {
  settings: EscapeSettings;
  onChange: (s: EscapeSettings) => void;
}

// ── Slider doré ──────────────────────────────────────────────────
function GoldSlider({ value, min = 0, max = 1, step = 0.05, onChange }: {
  value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
      {/* Track */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 3,
        borderRadius: 99, background: "rgba(212,175,55,0.18)",
      }} />
      {/* Fill */}
      <div style={{
        position: "absolute", left: 0, height: 3,
        width: `${pct}%`, borderRadius: 99,
        background: "linear-gradient(90deg,#8B6914,#D4AF37)",
      }} />
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          position: "absolute", inset: 0, width: "100%", opacity: 0,
          cursor: "pointer", height: "100%",
        }}
      />
      {/* Thumb */}
      <div style={{
        position: "absolute", left: `calc(${pct}% - 9px)`,
        width: 18, height: 18, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%,#FFE08A,#D4AF37)",
        border: "1.5px solid rgba(255,255,255,0.3)",
        boxShadow: "0 0 8px rgba(212,175,55,0.5)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Toggle doré ──────────────────────────────────────────────────
function GoldToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      whileTap={{ scale: 0.93 }}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: value
          ? "linear-gradient(90deg,#8B6914,#D4AF37)"
          : "rgba(255,255,255,0.08)",
        border: value ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.12)",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 0.2s, border 0.2s",
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
          background: value ? "#FFF8E0" : "rgba(255,255,255,0.4)",
          boxShadow: value ? "0 0 6px rgba(212,175,55,0.6)" : "none",
        }}
      />
    </motion.button>
  );
}

// ── Sélecteur 3 options ───────────────────────────────────────────
function ThreeWay<T extends string>({ value, options, onChange }: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            flex: 1, padding: "5px 0", borderRadius: 8, fontSize: 10,
            fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em",
            cursor: "pointer", border: "1px solid",
            background:    value === o.v ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.04)",
            borderColor:   value === o.v ? "var(--gold)"               : "rgba(255,255,255,0.08)",
            color:         value === o.v ? "var(--gold)"               : "rgba(248,244,236,0.45)",
            transition: "all 0.15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Ligne de réglage ──────────────────────────────────────────────
function Row({ icon, label, sub, children }: {
  icon: React.ReactNode; label: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: "rgba(212,175,55,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--gold)",
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "var(--text)", fontSize: 13, fontFamily: "var(--font-dm-sans)", margin: 0 }}>
            {label}
          </p>
          {sub && (
            <p style={{ color: "rgba(248,244,236,0.38)", fontSize: 10, fontFamily: "var(--font-dm-sans)", margin: "2px 0 0" }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      <div style={{ paddingLeft: 42 }}>{children}</div>
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────
export default function EscapeSettingsPanel({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const set = <K extends keyof EscapeSettings>(key: K, val: EscapeSettings[K]) => {
    onChange({ ...settings, [key]: val });
  };

  const volIcon = (v: number) => v === 0
    ? <VolumeX size={15} />
    : <Volume2 size={15} />;

  return (
    <>
      {/* Bouton engrenage */}
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.88 }}
        style={{
          position: "absolute", top: 12, right: 18, zIndex: 15,
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(10,15,13,0.72)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(212,175,55,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(212,175,55,0.7)", cursor: "pointer",
        }}
      >
        <Settings size={16} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 21,
                borderRadius: "24px 24px 0 0",
                background: "linear-gradient(180deg,#0E1A14 0%,#061A12 100%)",
                border: "1px solid rgba(212,175,55,0.18)",
                borderBottom: "none",
                padding: "0 20px 40px",
              }}
            >
              {/* Handle */}
              <div style={{
                width: 36, height: 4, borderRadius: 2, margin: "12px auto 0",
                background: "rgba(212,175,55,0.25)",
              }} />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 22px" }}>
                <p style={{ color: "var(--gold)", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", margin: 0 }}>
                  Réglages
                </p>
                <button onClick={() => setOpen(false)} style={{ color: "rgba(248,244,236,0.45)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                {/* Volume ambiance */}
                <Row icon={volIcon(settings.ambientVolume)} label="Ambiance sonore"
                  sub={settings.ambientVolume === 0 ? "Muet" : `${Math.round(settings.ambientVolume * 100)} %`}>
                  <GoldSlider value={settings.ambientVolume}
                    onChange={v => set("ambientVolume", v)} />
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Volume UI */}
                <Row icon={volIcon(settings.uiVolume)} label="Sons d'interface"
                  sub={settings.uiVolume === 0 ? "Muet" : `Pas, énigmes — ${Math.round(settings.uiVolume * 100)} %`}>
                  <GoldSlider value={settings.uiVolume}
                    onChange={v => set("uiVolume", v)} />
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Vibrations */}
                <Row icon={settings.vibrations ? <SmartphoneNfc size={15} /> : <Smartphone size={15} />}
                  label="Vibrations" sub="Retour haptique à chaque interaction">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(248,244,236,0.38)", fontFamily: "var(--font-dm-sans)" }}>
                      {settings.vibrations ? "Activées" : "Désactivées"}
                    </span>
                    <GoldToggle value={settings.vibrations} onChange={v => set("vibrations", v)} />
                  </div>
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Sensibilité */}
                <Row icon={<Eye size={15} />} label="Sensibilité caméra"
                  sub={`${settings.sensitivity < 0.8 ? "Lente" : settings.sensitivity > 1.3 ? "Rapide" : "Normale"} — swipe pour regarder`}>
                  <GoldSlider value={settings.sensitivity} min={0.4} max={2.0} step={0.1}
                    onChange={v => set("sensitivity", v)} />
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Transition */}
                <Row icon={<Wind size={15} />} label="Vitesse des transitions"
                  sub="Fondu entre les pièces">
                  <ThreeWay<EscapeSettings["transitionSpeed"]>
                    value={settings.transitionSpeed}
                    options={[
                      { v: "slow",   label: "Lente"  },
                      { v: "normal", label: "Normale" },
                      { v: "fast",   label: "Rapide"  },
                    ]}
                    onChange={v => set("transitionSpeed", v)}
                  />
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Difficulté */}
                <Row icon={<GraduationCap size={15} />} label="Niveau des énigmes"
                  sub={
                    settings.difficulty === "debutant"       ? "Français + arabe — idéal pour découvrir" :
                    settings.difficulty === "intermediaire"  ? "Arabe + phonétique — pour progresser" :
                                                               "Arabe seul — pour les confirmés"
                  }>
                  <ThreeWay<EscapeSettings["difficulty"]>
                    value={settings.difficulty}
                    options={[
                      { v: "debutant",      label: "🌱 Débutant"      },
                      { v: "intermediaire", label: "🌙 Inter."        },
                      { v: "expert",        label: "⭐ Expert"         },
                    ]}
                    onChange={v => set("difficulty", v)}
                  />
                </Row>

                <div style={{ height: 1, background: "var(--bg-gold)" }} />

                {/* Qualité */}
                <Row icon={<Zap size={15} />} label="Qualité graphique"
                  sub={settings.quality === "high"
                    ? "Anti-aliasing + Bloom — plus beau, moins fluide"
                    : "Bloom seul — plus fluide sur ancien appareil"}>
                  <ThreeWay<EscapeSettings["quality"]>
                    value={settings.quality}
                    options={[
                      { v: "low",  label: "Économique" },
                      { v: "high", label: "Haute"      },
                    ]}
                    onChange={v => set("quality", v)}
                  />
                </Row>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
