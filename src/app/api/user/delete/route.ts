import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // ── Suppression des données utilisateur ──────────────────────
  // Les tables sont supprimées dans l'ordre pour éviter les
  // violations de contraintes de clé étrangère.
  const tablesToDelete: Array<{ table: string; column: string }> = [
    { table: "companion_messages",  column: "user_id" },
    { table: "companion_memory",    column: "user_id" },
    { table: "question_history",    column: "user_id" },
    { table: "story_progress",      column: "user_id" },
    { table: "player_progress",     column: "user_id" },
    { table: "rewards",             column: "user_id" },
    { table: "achievements",        column: "user_id" },
    { table: "push_subscriptions",  column: "user_id" },
    { table: "profiles",            column: "id" },
  ];

  for (const { table, column } of tablesToDelete) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(column, userId);

    // On ignore les erreurs "table inexistante" (42P01) pour la robustesse
    // mais on propage les vraies erreurs de suppression.
    if (error && error.code !== "42P01") {
      return NextResponse.json(
        { error: `Erreur lors de la suppression de ${table}` },
        { status: 500 }
      );
    }
  }

  // ── Suppression du compte auth ────────────────────────────────
  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
