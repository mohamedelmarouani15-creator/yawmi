"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap } from "@/lib/motion";

interface LeaderEntry { userId: string; level: number; xp: number; rank: number; isMe: boolean }

function hashName(id: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) & 0xffffffff;
  return Array.from({ length: 4 }, (_, i) => chars[Math.abs((n >> (i * 5)) % chars.length)]).join("");
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function ClassementPage() {
  const router   = useRouter();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank,  setMyRank]  = useState<number | null>(null);
  const local = gameStorage.get();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("player_progress")
        .select("user_id,level,xp")
        .order("xp", { ascending: false })
        .limit(50);

      if (!data) { setLoading(false); return; }

      const entries: LeaderEntry[] = data.map((row, i) => ({
        userId: row.user_id as string,
        level:  row.level as number ?? 1,
        xp:     row.xp    as number ?? 0,
        rank:   i + 1,
        isMe:   user?.id === row.user_id,
      }));

      setLeaders(entries);
      const me = entries.find(e => e.isMe);
      setMyRank(me?.rank ?? null);
      setLoading(false);
    }
    load();
  }, []);

  const myLocalLevel = local.level ?? 1;
  const myLocalXP    = local.xp ?? 0;

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-12 pb-10 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>

      <div className="flex items-center gap-3 mb-5">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: "#D4AF37" }} />
          <h1 className="text-lg font-black" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Classement mondial
          </h1>
        </div>
      </div>

      {/* My position card */}
      <div className="rounded-2xl border p-4 mb-5 flex items-center gap-4"
        style={{ background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.25)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black"
          style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
          {myRank ?? "?"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-black" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            Ta position — Niv. {myLocalLevel}
          </p>
          <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {myLocalXP.toLocaleString()} XP · {myRank ? `Top ${Math.ceil(myRank / Math.max(leaders.length, 1) * 100)}%` : "Non classé"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2"
            style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaders.slice(0, 20).map((entry) => (
            <motion.div key={entry.userId}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: entry.rank * 0.03 }}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{
                background: entry.isMe ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                borderColor: entry.isMe ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.07)",
              }}>
              <span className="text-base w-6 text-center" style={{ fontFamily: "var(--font-bricolage)" }}>
                {entry.rank <= 3 ? MEDAL[entry.rank - 1] : <span className="text-xs opacity-40" style={{ color: "var(--text)" }}>{entry.rank}</span>}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black"
                style={{ background: entry.isMe ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)", color: entry.isMe ? "#D4AF37" : "rgba(248,244,236,0.5)", fontFamily: "var(--font-bricolage)" }}>
                {hashName(entry.userId)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: entry.isMe ? "#D4AF37" : "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                  {entry.isMe ? "Toi" : `Joueur ${hashName(entry.userId)}`}
                </p>
                <p className="text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {entry.xp.toLocaleString()} XP
                </p>
              </div>
              <span className="text-sm font-black" style={{ color: entry.isMe ? "#D4AF37" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-bricolage)" }}>
                Niv.{entry.level}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.main>
  );
}
