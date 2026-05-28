"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Family, type SupaTask } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export function useFamily() {
  const { user }                        = useAuth();
  const [family,  setFamily]            = useState<Family | null>(null);
  const [tasks,   setTasks]             = useState<SupaTask[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let cleanup: (() => void) | undefined;

    async function init() {
      const { data: profile } = await supabase
        .from("profiles").select("family_id").eq("id", user!.id).single();

      if (!profile?.family_id) { setLoading(false); return; }

      const [{ data: fam }, { data: taskRows }] = await Promise.all([
        supabase.from("families").select("*").eq("id", profile.family_id).single(),
        supabase.from("tasks").select("*").eq("family_id", profile.family_id).order("created_at", { ascending: false }),
      ]);

      setFamily(fam);
      setTasks(taskRows ?? []);
      setLoading(false);

      // Temps réel
      const channel = supabase
        .channel("tasks:" + profile.family_id)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "tasks", filter: `family_id=eq.${profile.family_id}` },
          ({ eventType, new: n, old: o }) => {
            if (eventType === "INSERT") setTasks(t => [n as SupaTask, ...t]);
            if (eventType === "UPDATE") setTasks(t => t.map(x => x.id === (n as SupaTask).id ? n as SupaTask : x));
            if (eventType === "DELETE") setTasks(t => t.filter(x => x.id !== (o as SupaTask).id));
          }
        )
        .subscribe();

      cleanup = () => { supabase.removeChannel(channel); };
    }

    init();
    return () => cleanup?.();
  }, [user]);

  const createFamily = useCallback(async (name: string) => {
    if (!user) return;
    const { data: fam } = await supabase
      .from("families").insert({ name, created_by: user.id }).select().single();
    if (fam) {
      await supabase.from("profiles").update({ family_id: fam.id }).eq("id", user.id);
      setFamily(fam);
    }
  }, [user]);

  const joinFamily = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    const { data: fam } = await supabase
      .from("families").select().eq("code", code.toUpperCase().trim()).single();
    if (!fam) return false;
    await supabase.from("profiles").update({ family_id: fam.id }).eq("id", user.id);
    setFamily(fam);
    return true;
  }, [user]);

  const addTask = useCallback(async (text: string, member: string) => {
    if (!family || !user) return;
    await supabase.from("tasks").insert({ family_id: family.id, text, member, created_by: user.id });
  }, [family, user]);

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    await supabase.from("tasks").update({ done: !done }).eq("id", id);
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
  }, []);

  return { family, tasks, loading, createFamily, joinFamily, addTask, toggleTask, removeTask };
}
