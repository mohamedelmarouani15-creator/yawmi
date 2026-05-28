"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

const MEMBERS = ["Tous", "Papa", "Maman", "Enfants"];
const COLORS: Record<string, string> = {
  Tous:    "#055C3F",
  Papa:    "#7B5EA7",
  Maman:   "#D4AF37",
  Enfants: "#C0634E",
};

export default function FamillePage() {
  const { tasks, add, toggle, remove } = useTasks();
  const [text,   setText]   = useState("");
  const [member, setMember] = useState("Tous");
  const [open,   setOpen]   = useState(false);

  function submit() {
    const t = text.trim();
    if (!t) return;
    add(t, member);
    setText("");
    setOpen(false);
  }

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Espace partagé
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Famille
          </h1>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95"
          style={{ background: "rgba(5,92,63,0.6)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          <Plus size={16} /> Tâche
        </button>
      </div>

      {/* Formulaire ajout */}
      {open && (
        <div
          className="flex flex-col gap-3 rounded-2xl border p-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.2)" }}
        >
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Nouvelle tâche…"
            className="w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)",
            }}
            autoFocus
          />
          <div className="flex gap-2">
            {MEMBERS.map(m => (
              <button
                key={m}
                onClick={() => setMember(m)}
                className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  background: member === m ? COLORS[m] : "rgba(255,255,255,0.04)",
                  color: member === m ? "#F8F4EC" : "rgba(248,244,236,0.4)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            className="rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #055C3F, #0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Tâches en cours */}
      {pending.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            En cours · {pending.length}
          </p>
          <div className="flex flex-col gap-2">
            {pending.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => toggle(task.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {task.text}
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: COLORS[task.member] ?? "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}
                >
                  {task.member}
                </span>
                <button onClick={() => remove(task.id)} style={{ color: "rgba(248,244,236,0.2)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tâches terminées */}
      {completed.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Terminées · {completed.length}
          </p>
          <div className="flex flex-col gap-2">
            {completed.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}
              >
                <button
                  onClick={() => toggle(task.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#055C3F" }}
                >
                  <span style={{ color: "#F8F4EC", fontSize: 10 }}>✓</span>
                </button>
                <p
                  className="flex-1 text-sm"
                  style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)", textDecoration: "line-through" }}
                >
                  {task.text}
                </p>
                <button onClick={() => remove(task.id)} style={{ color: "rgba(248,244,236,0.15)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !open && (
        <div className="py-12 text-center">
          <p className="text-sm opacity-30" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Aucune tâche. Appuie sur + Tâche pour commencer.
          </p>
        </div>
      )}
    </main>
  );
}
