"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Copy, Check, Loader2, Trophy, Swords } from "lucide-react";
import { gameStorage } from "@/lib/game/game-storage";
import { supabase } from "@/lib/supabase";
import { springTap } from "@/lib/motion";

// ── Types ─────────────────────────────────────────────────────────

interface ConfrerieMember {
  user_id: string;
  joined_at: string;
  xp: number;
  level: number;
  display_name: string | null;
  total_correct_answers: number;
}

interface ConferieRow {
  id: string;
  name: string;
  code: string;
  created_by: string | null;
  created_at: string;
}

type ViewState = "loading" | "none" | "mine";

// ── Random code generator ─────────────────────────────────────────

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Cache (localStorage) ──────────────────────────────────────────

const CACHE_KEY = "yawmi_confrerie_cache_v2";

interface CachedConfrerie {
  id: string;
  name: string;
  code: string;
}

function loadCache(): CachedConfrerie | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null"); } catch { return null; }
}

function saveCache(c: CachedConfrerie): void {
  if (typeof window !== "undefined") localStorage.setItem(CACHE_KEY, JSON.stringify(c));
}

function clearCache(): void {
  if (typeof window !== "undefined") localStorage.removeItem(CACHE_KEY);
}

// ── Component ─────────────────────────────────────────────────────

export default function ConfreriePage() {
  const router  = useRouter();
  const state   = gameStorage.get();

  const [view,       setView]       = useState<ViewState>("loading");
  const [confrerie,  setConfrerie]  = useState<ConferieRow | null>(null);
  const [members,    setMembers]    = useState<ConfrerieMember[]>([]);
  const [myUserId,   setMyUserId]   = useState<string | null>(null);

  // Create flow
  const [confName,   setConfName]   = useState("");
  const [creating,   setCreating]   = useState(false);
  const [createErr,  setCreateErr]  = useState("");

  // Join flow
  const [joinInput,  setJoinInput]  = useState("");
  const [joining,    setJoining]    = useState(false);
  const [joinError,  setJoinError]  = useState("");

  // UI
  const [copied,     setCopied]     = useState(false);
  const [renaming,   setRenaming]   = useState(false);
  const [newName,    setNewName]    = useState("");

  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Bootstrap ──────────────────────────────────────────────────

  const loadMembers = useCallback(async (confrerieId: string) => {
    // Get member user_ids + joined_at
    const { data: memberRows } = await supabase
      .from("confrerie_members")
      .select("user_id, joined_at")
      .eq("confrerie_id", confrerieId);

    if (!memberRows || memberRows.length === 0) { setMembers([]); return; }

    const userIds = memberRows.map(r => r.user_id as string);

    // Fetch XP + level from player_progress
    const { data: progressRows } = await supabase
      .from("player_progress")
      .select("user_id, xp, level, total_correct_answers")
      .in("user_id", userIds);

    // Fetch display names from profiles
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const progressMap = new Map(
      (progressRows ?? []).map(r => [
        r.user_id as string,
        { xp: r.xp as number, level: r.level as number, total_correct_answers: r.total_correct_answers as number ?? 0 },
      ])
    );
    const profileMap = new Map(
      (profileRows ?? []).map(r => [r.id as string, r.display_name as string | null])
    );

    const merged: ConfrerieMember[] = memberRows.map(r => {
      const uid = r.user_id as string;
      const prog = progressMap.get(uid);
      return {
        user_id: uid,
        joined_at: r.joined_at as string,
        xp: prog?.xp ?? 0,
        level: prog?.level ?? 1,
        display_name: profileMap.get(uid) ?? null,
        total_correct_answers: prog?.total_correct_answers ?? 0,
      };
    });

    // Sort by XP desc
    merged.sort((a, b) => b.xp - a.xp);
    setMembers(merged);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) { setView("none"); return; }

      setMyUserId(user.id);

      // Check cache first for instant display
      const cached = loadCache();

      // Look up membership in Supabase
      const { data: memberRow } = await supabase
        .from("confrerie_members")
        .select("confrerie_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (!memberRow) {
        clearCache();
        setView("none");
        return;
      }

      const confrerieId = memberRow.confrerie_id as string;

      // Use cache if IDs match for instant render
      if (cached?.id === confrerieId) {
        setConfrerie({ id: cached.id, name: cached.name, code: cached.code, created_by: null, created_at: "" });
        setView("mine");
      }

      // Always re-fetch fresh data
      const { data: confRow } = await supabase
        .from("confreries")
        .select("id, name, code, created_by, created_at")
        .eq("id", confrerieId)
        .single();

      if (!mounted) return;

      if (confRow) {
        const c = confRow as ConferieRow;
        setConfrerie(c);
        saveCache({ id: c.id, name: c.name, code: c.code });
        setView("mine");
        await loadMembers(c.id);

        // Subscribe to realtime membership changes
        realtimeRef.current = supabase
          .channel(`confrerie_members:${c.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "confrerie_members", filter: `confrerie_id=eq.${c.id}` },
            () => { loadMembers(c.id); }
          )
          .subscribe();
      } else {
        clearCache();
        setView("none");
      }
    }

    init();
    return () => {
      mounted = false;
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, [loadMembers]);

  // ── Create confrérie ───────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!confName.trim() || !myUserId) { setCreateErr("Donne un nom à ta confrérie"); return; }
    setCreating(true);
    setCreateErr("");

    // Try up to 5 times in case of code collision
    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      const code = randomCode();
      const { data, error } = await supabase
        .from("confreries")
        .insert({ name: confName.trim(), code, created_by: myUserId })
        .select("id, name, code, created_by, created_at")
        .single();

      if (error) {
        if (error.code === "23505" && attempts < 5) continue; // unique violation → retry
        setCreateErr("Erreur lors de la création. Réessaie.");
        setCreating(false);
        return;
      }

      if (!data) { setCreateErr("Erreur inattendue."); setCreating(false); return; }

      const c = data as ConferieRow;

      // Auto-join creator
      await supabase
        .from("confrerie_members")
        .insert({ confrerie_id: c.id, user_id: myUserId });

      saveCache({ id: c.id, name: c.name, code: c.code });
      setConfrerie(c);
      setView("mine");
      await loadMembers(c.id);

      // Subscribe to realtime
      realtimeRef.current = supabase
        .channel(`confrerie_members:${c.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "confrerie_members", filter: `confrerie_id=eq.${c.id}` },
          () => { loadMembers(c.id); }
        )
        .subscribe();

      setCreating(false);
      return;
    }

    setCreateErr("Impossible de générer un code unique. Réessaie.");
    setCreating(false);
  }, [confName, myUserId, loadMembers]);

  // ── Join confrérie ─────────────────────────────────────────────

  const handleJoin = useCallback(async () => {
    const code = joinInput.trim().toUpperCase();
    if (code.length !== 6) { setJoinError("Code invalide — 6 caractères requis"); return; }
    if (!myUserId) return;

    setJoining(true);
    setJoinError("");

    const { data: confRow, error: confErr } = await supabase
      .from("confreries")
      .select("id, name, code, created_by, created_at")
      .eq("code", code)
      .maybeSingle();

    if (confErr || !confRow) {
      setJoinError("Code introuvable. Vérifie avec ton proche.");
      setJoining(false);
      return;
    }

    const c = confRow as ConferieRow;

    // Check already member
    const { data: existing } = await supabase
      .from("confrerie_members")
      .select("user_id")
      .eq("confrerie_id", c.id)
      .eq("user_id", myUserId)
      .maybeSingle();

    if (existing) {
      setJoinError("Tu es déjà membre de cette confrérie.");
      setJoining(false);
      return;
    }

    const { error: insertErr } = await supabase
      .from("confrerie_members")
      .insert({ confrerie_id: c.id, user_id: myUserId });

    if (insertErr) {
      setJoinError("Erreur lors de la jonction. Réessaie.");
      setJoining(false);
      return;
    }

    saveCache({ id: c.id, name: c.name, code: c.code });
    setConfrerie(c);
    setView("mine");
    await loadMembers(c.id);
    setJoining(false);
    setJoinInput("");
  }, [joinInput, myUserId, loadMembers]);

  // ── Leave confrérie ────────────────────────────────────────────

  const handleLeave = useCallback(async () => {
    if (!confrerie || !myUserId) return;
    await supabase
      .from("confrerie_members")
      .delete()
      .eq("confrerie_id", confrerie.id)
      .eq("user_id", myUserId);
    clearCache();
    setConfrerie(null);
    setMembers([]);
    setView("none");
  }, [confrerie, myUserId]);

  // ── Rename ─────────────────────────────────────────────────────

  const handleRename = useCallback(async () => {
    if (!newName.trim() || !confrerie) return;
    const { error } = await supabase
      .from("confreries")
      .update({ name: newName.trim() })
      .eq("id", confrerie.id)
      .eq("created_by", myUserId ?? "");

    if (!error) {
      const updated = { ...confrerie, name: newName.trim() };
      setConfrerie(updated);
      saveCache({ id: updated.id, name: updated.name, code: updated.code });
      setRenaming(false);
      setNewName("");
    }
  }, [newName, confrerie, myUserId]);

  // ── Copy code ──────────────────────────────────────────────────

  const copyCode = useCallback(() => {
    if (!confrerie?.code) return;
    navigator.clipboard?.writeText(confrerie.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [confrerie]);

  // ── Derived stats ──────────────────────────────────────────────

  const totalCorrect = state.totalCorrectAnswers ?? 0;
  const level        = state.level ?? 1;
  const arcs         = (state.completedArcs ?? []).length;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-12 pb-10 gap-5 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.9 }}
          transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}
        >
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: "#a78bfa" }} />
          <h1
            className="text-lg font-black"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}
          >
            Confrérie du Savoir
          </h1>
        </div>
      </div>

      <p
        className="text-xs opacity-50 -mt-3"
        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
      >
        Rejoins ta famille pour progresser ensemble
      </p>

      {/* Loading */}
      {view === "loading" && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "#a78bfa" }} />
        </div>
      )}

      {/* No confrérie — create or join */}
      {view === "none" && (
        <>
          {/* My stats */}
          <div
            className="rounded-3xl border p-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-3"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Mes contributions
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: totalCorrect, label: "Réponses justes", icon: "✅" },
                { val: level,        label: "Niveau",           icon: "⭐" },
                { val: arcs,         label: "Histoires lues",   icon: "📖" },
              ].map(({ val, label, icon }) => (
                <div key={label} className="text-center">
                  <p className="text-xl">{icon}</p>
                  <p
                    className="text-lg font-black"
                    style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)" }}
                  >
                    {val}
                  </p>
                  <p
                    className="text-[9px] opacity-40"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Create */}
          <div
            className="rounded-3xl border p-5"
            style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.25)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-3"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Créer une confrérie
            </p>
            <div className="flex gap-2">
              <input
                value={confName}
                onChange={e => setConfName(e.target.value)}
                placeholder="Nom de ta confrérie"
                maxLength={30}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  color: "var(--text)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
              <motion.button
                onClick={handleCreate}
                disabled={creating || !confName.trim()}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-4 py-2 text-sm font-black flex items-center gap-1.5 disabled:opacity-40"
                style={{ background: "#a78bfa", color: "#0a0f0d", fontFamily: "var(--font-dm-sans)" }}
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : "Créer"}
              </motion.button>
            </div>
            {createErr && (
              <p
                className="text-[10px] mt-2"
                style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}
              >
                {createErr}
              </p>
            )}
          </div>

          {/* Join */}
          <div
            className="rounded-3xl border p-5"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-3"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Rejoindre une confrérie
            </p>
            <div className="flex gap-2">
              <input
                value={joinInput}
                onChange={e => setJoinInput(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="Code à 6 lettres"
                maxLength={6}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold text-center uppercase outline-none tracking-widest"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text)",
                  fontFamily: "var(--font-bricolage)",
                }}
              />
              <motion.button
                onClick={handleJoin}
                disabled={joining || joinInput.length !== 6}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-4 py-2.5 text-sm font-black flex items-center gap-1.5 disabled:opacity-40"
                style={{
                  background: "rgba(167,139,250,0.15)",
                  color: "#a78bfa",
                  border: "1px solid rgba(167,139,250,0.3)",
                  fontFamily: "var(--font-bricolage)",
                }}
              >
                {joining ? <Loader2 size={14} className="animate-spin" /> : "Rejoindre"}
              </motion.button>
            </div>
            {joinError && (
              <p
                className="text-[10px] mt-2"
                style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}
              >
                {joinError}
              </p>
            )}
          </div>
        </>
      )}

      {/* Has confrérie */}
      {view === "mine" && confrerie && (
        <>
          {/* Code card */}
          <div
            className="rounded-3xl border p-5"
            style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.25)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-2"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              {confrerie.name} — Code d&apos;invitation
            </p>
            <div className="flex items-center gap-3">
              <span
                className="text-3xl font-black tracking-widest"
                style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)", letterSpacing: "0.15em" }}
              >
                {confrerie.code}
              </span>
              <motion.button
                onClick={copyCode}
                whileTap={{ scale: 0.9 }}
                transition={springTap}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}
              >
                {copied
                  ? <Check size={15} style={{ color: "#4ade80" }} />
                  : <Copy size={15} style={{ color: "#a78bfa" }} />
                }
              </motion.button>
            </div>
            {copied && (
              <p
                className="text-[10px] mt-1.5"
                style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}
              >
                Code copié !
              </p>
            )}

            {/* Rename (creator only) */}
            {confrerie.created_by === myUserId && !renaming && (
              <button
                onClick={() => { setRenaming(true); setNewName(confrerie.name); }}
                className="mt-3 text-[10px] opacity-40 hover:opacity-70"
                style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}
              >
                Renommer
              </button>
            )}
            {renaming && (
              <div className="flex gap-2 mt-3">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  maxLength={30}
                  className="flex-1 rounded-xl px-3 py-1.5 text-xs outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    color: "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                />
                <motion.button
                  onClick={handleRename}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold"
                  style={{ background: "#a78bfa", color: "#0a0f0d", fontFamily: "var(--font-dm-sans)" }}
                >
                  OK
                </motion.button>
                <button
                  onClick={() => setRenaming(false)}
                  className="text-[10px] opacity-40 px-2"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* My stats */}
          <div
            className="rounded-3xl border p-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-3"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Mes contributions
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: totalCorrect, label: "Réponses justes", icon: "✅" },
                { val: level,        label: "Niveau",           icon: "⭐" },
                { val: arcs,         label: "Histoires lues",   icon: "📖" },
              ].map(({ val, label, icon }) => (
                <div key={label} className="text-center">
                  <p className="text-xl">{icon}</p>
                  <p
                    className="text-lg font-black"
                    style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)" }}
                  >
                    {val}
                  </p>
                  <p
                    className="text-[9px] opacity-40"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Members leaderboard */}
          <div
            className="rounded-3xl border p-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[9px] uppercase tracking-widest opacity-40"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Membres ({members.length})
              </p>
              <Trophy size={12} style={{ color: "#D4AF37", opacity: 0.6 }} />
            </div>

            {members.length === 0 ? (
              <p
                className="text-xs opacity-40 text-center py-4"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Partage le code pour inviter ta famille
              </p>
            ) : (
              members.map((m, idx) => {
                const isMe = m.user_id === myUserId;
                const medals = ["🥇", "🥈", "🥉"];
                const medal = medals[idx] ?? null;
                const name = m.display_name ?? `Joueur ${m.user_id.slice(0, 4).toUpperCase()}`;
                return (
                  <div
                    key={m.user_id}
                    className="flex items-center gap-3 py-2.5 border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {/* Rank / medal */}
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                      style={{
                        background: isMe ? "rgba(167,139,250,0.2)" : "rgba(167,139,250,0.08)",
                        color: "#a78bfa",
                        fontFamily: "var(--font-bricolage)",
                      }}
                    >
                      {medal ?? (idx + 1)}
                    </div>

                    {/* Name + stats */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-bold truncate"
                        style={{
                          color: isMe ? "#a78bfa" : "rgba(248,244,236,0.75)",
                          fontFamily: "var(--font-bricolage)",
                        }}
                      >
                        {name}{isMe ? " (toi)" : ""}
                      </p>
                      <p
                        className="text-[9px] opacity-40"
                        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                      >
                        Niv. {m.level} · {m.total_correct_answers} réponses
                      </p>
                    </div>

                    {/* XP */}
                    <span
                      className="text-xs font-black"
                      style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {m.xp.toLocaleString()} XP
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Liga shortcut */}
          <motion.button
            onClick={() => router.push("/oasis/liga")}
            whileTap={{ scale: 0.97 }}
            transition={springTap}
            className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
            style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.2)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
              style={{ background: "rgba(212,175,55,0.1)" }}
            >
              <Swords size={18} style={{ color: "#D4AF37" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-black"
                style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}
              >
                Liga hebdomadaire
              </p>
              <p
                className="text-[10px] opacity-50 mt-0.5"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Classement par ligue · Bronze, Argent, Or, Diamant
              </p>
            </div>
            <span className="text-sm opacity-40" style={{ color: "#D4AF37" }}>→</span>
          </motion.button>

          {/* Leave */}
          <button
            onClick={handleLeave}
            className="text-[11px] opacity-30 hover:opacity-60 text-center mt-2 transition-opacity"
            style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}
          >
            Quitter la confrérie
          </button>
        </>
      )}
    </motion.main>
  );
}
