"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getRecitationDuel, submitRecitationDuelScore, type RecitationDuel } from "@/lib/recitation-duel";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function RecitationDuelPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [duel,   setDuel]   = useState<RecitationDuel | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [score,  setScore]  = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
    });
    getRecitationDuel(id).then(setDuel);
  }, [id]);

  if (!duel) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-6 h-6 border-2 border-current rounded-full border-t-transparent"
        style={{ color: "var(--gold)" }} />
    </div>
  );

  const isChallenger = userId === duel.challengerId;
  const myScore      = isChallenger ? duel.challengerScore : duel.challengedScore;
  const opponentScore = isChallenger ? duel.challengedScore : duel.challengerScore;

  async function handleSubmit(s: number) {
    await submitRecitationDuelScore(id, isChallenger, s);
    setSubmitted(true);
    setScore(s);
  }

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-8 min-h-screen" style={{ background: "#0A0F0D" }}>
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Duel de récitation
          </p>
          <h1 className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Sourate {duel.surah} · Versets {duel.ayahStart}–{duel.ayahEnd}
          </h1>
        </div>
      </div>

      {/* Versets à réciter */}
      <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.04)" }}>
        <p className="text-xs opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Récite ces {duel.ayahEnd - duel.ayahStart + 1} verset{duel.ayahEnd > duel.ayahStart ? "s" : ""} :
        </p>
        <p className="text-right text-2xl leading-loose"
          style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          {/* On affiche juste l&apos;indication — l&apos;utilisateur consulte la page Coran */}
          Sourate {duel.surah}, versets {duel.ayahStart} à {duel.ayahEnd}
        </p>
        <button
          onClick={() => router.push(`/coran`)}
          className="mt-3 text-xs opacity-50 underline"
          style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
          Voir dans le Coran →
        </button>
      </div>

      {/* Score soumis */}
      {(myScore !== null || submitted) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4"
          style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} color="#22c55e" />
            <div>
              <p className="font-bold text-sm" style={{ color: "#22c55e", fontFamily: "var(--font-dm-sans)" }}>
                Ton score : {score ?? myScore}%
              </p>
              <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {opponentScore !== null
                  ? `Score adversaire : ${opponentScore}%`
                  : "En attente du score adverse…"}
              </p>
            </div>
            {duel.status === "completed" && duel.winnerId === userId && (
              <span className="ml-auto text-xl">🏆</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Soumettre un score manuel (simplifié — sans ASR dans cette page) */}
      {myScore === null && !submitted && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Va réciter ces versets dans la page Coran, puis reviens noter ton score :
          </p>
          <div className="flex gap-2">
            {[60, 70, 80, 90, 100].map(s => (
              <button key={s}
                onClick={() => handleSubmit(s)}
                className="flex-1 rounded-xl border py-3 text-sm font-bold"
                style={{
                  borderColor: "rgba(212,175,55,0.25)",
                  color: "var(--gold)",
                  background: "rgba(212,175,55,0.06)",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
