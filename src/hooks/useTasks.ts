"use client";

import { useState, useEffect, useCallback } from "react";
import { storage, type Task } from "@/lib/storage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(storage.getTasks());
  }, []);

  const persist = useCallback((next: Task[]) => {
    storage.saveTasks(next);
    setTasks(next);
  }, []);

  const add = useCallback((text: string, member: string) => {
    const task: Task = {
      id:        crypto.randomUUID(),
      text,
      member,
      done:      false,
      createdAt: Date.now(),
    };
    persist([...storage.getTasks(), task]);
  }, [persist]);

  const toggle = useCallback((id: string) => {
    persist(storage.getTasks().map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [persist]);

  const remove = useCallback((id: string) => {
    persist(storage.getTasks().filter(t => t.id !== id));
  }, [persist]);

  return { tasks, add, toggle, remove };
}
