import { supabase } from "./supabase";

export interface RecitationDuel {
  id:                         string;
  challengerId:               string;
  challengedId:               string;
  surah:                      number;
  ayahStart:                  number;
  ayahEnd:                    number;
  challengerScore:            number | null;
  challengedScore:            number | null;
  status:                     "pending" | "completed" | "expired";
  winnerId:                   string | null;
  expiresAt:                  string;
  createdAt:                  string;
}

function mapDuel(d: Record<string, unknown>): RecitationDuel {
  return {
    id:                  d.id as string,
    challengerId:        d.challenger_id as string,
    challengedId:        d.challenged_id as string,
    surah:               (d.recitation_surah as number) ?? 1,
    ayahStart:           (d.recitation_ayah_start as number) ?? 1,
    ayahEnd:             (d.recitation_ayah_end as number) ?? 3,
    challengerScore:     d.challenger_recitation_score as number | null,
    challengedScore:     d.challenged_recitation_score as number | null,
    status:              d.status as RecitationDuel["status"],
    winnerId:            d.winner_id as string | null,
    expiresAt:           d.expires_at as string,
    createdAt:           d.created_at as string,
  };
}

export async function createRecitationDuel(
  challengedId: string,
  surah:        number,
  ayahStart:    number,
  ayahEnd:      number,
): Promise<RecitationDuel | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("duels")
    .insert({
      challenger_id:          session.user.id,
      challenged_id:          challengedId,
      duel_type:              "recitation",
      recitation_surah:       surah,
      recitation_ayah_start:  ayahStart,
      recitation_ayah_end:    ayahEnd,
      status:                 "pending",
      expires_at:             expiresAt,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapDuel(data as Record<string, unknown>);
}

export async function getRecitationDuel(duelId: string): Promise<RecitationDuel | null> {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", duelId)
    .eq("duel_type", "recitation")
    .single();

  if (error || !data) return null;
  return mapDuel(data as Record<string, unknown>);
}

export async function submitRecitationDuelScore(
  duelId:       string,
  isChallenger: boolean,
  score:        number,
): Promise<void> {
  if (isChallenger) {
    await supabase.from("duels").update({ challenger_recitation_score: score }).eq("id", duelId);
  } else {
    await supabase.from("duels").update({ challenged_recitation_score: score }).eq("id", duelId);
  }

  // Vérifier si les deux ont soumis → calculer gagnant
  const { data } = await supabase
    .from("duels")
    .select("challenger_id, challenged_id, challenger_recitation_score, challenged_recitation_score")
    .eq("id", duelId)
    .single();

  if (
    data &&
    data.challenger_recitation_score !== null &&
    data.challenged_recitation_score !== null
  ) {
    const winnerId = (data.challenger_recitation_score ?? 0) >= (data.challenged_recitation_score ?? 0)
      ? data.challenger_id
      : data.challenged_id;
    await supabase.from("duels").update({ status: "completed", winner_id: winnerId }).eq("id", duelId);
  }
}

export async function getPendingRecitationDuels(): Promise<RecitationDuel[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data } = await supabase
    .from("duels")
    .select("*")
    .eq("duel_type", "recitation")
    .eq("status", "pending")
    .or(`challenger_id.eq.${session.user.id},challenged_id.eq.${session.user.id}`)
    .order("created_at", { ascending: false });

  return (data ?? []).map(d => mapDuel(d as Record<string, unknown>));
}
