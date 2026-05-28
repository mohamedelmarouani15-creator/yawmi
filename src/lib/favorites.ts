const KEY = "yawmi_favorites";

export interface FavoriteAyah {
  surah:       number;
  surahName:   string;
  ayah:        number;
  text:        string;
  savedAt:     number;
}

export const favorites = {
  getAll(): FavoriteAyah[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
  },

  add(fav: Omit<FavoriteAyah, "savedAt">) {
    const all = this.getAll();
    if (all.some(f => f.surah === fav.surah && f.ayah === fav.ayah)) return;
    all.unshift({ ...fav, savedAt: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  remove(surah: number, ayah: number) {
    const next = this.getAll().filter(f => !(f.surah === surah && f.ayah === ayah));
    localStorage.setItem(KEY, JSON.stringify(next));
  },

  has(surah: number, ayah: number): boolean {
    return this.getAll().some(f => f.surah === surah && f.ayah === ayah);
  },
};
