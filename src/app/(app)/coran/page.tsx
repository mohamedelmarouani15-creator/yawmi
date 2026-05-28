const SURAHS = [
  { number: 1,   name: "Al-Fatiha",   arabic: "الفاتحة",   verses: 7   },
  { number: 2,   name: "Al-Baqara",   arabic: "البقرة",    verses: 286 },
  { number: 3,   name: "Al-Imran",    arabic: "آل عمران",  verses: 200 },
  { number: 36,  name: "Ya-Sin",      arabic: "يس",        verses: 83  },
  { number: 55,  name: "Ar-Rahman",   arabic: "الرحمن",    verses: 78  },
  { number: 67,  name: "Al-Mulk",     arabic: "الملك",     verses: 30  },
  { number: 112, name: "Al-Ikhlas",   arabic: "الإخلاص",   verses: 4   },
  { number: 113, name: "Al-Falaq",    arabic: "الفلق",     verses: 5   },
  { number: 114, name: "An-Nas",      arabic: "الناس",     verses: 6   },
];

export default function CoranPage() {
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Lecture
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Coran
        </h1>
      </div>

      {/* Continuer la lecture */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #055C3F 0%, #033d2a 100%)",
          boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
        }}
      >
        <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Continuer
        </p>
        <p className="mt-2 text-lg font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Al-Baqara
        </p>
        <p className="text-sm opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Verset 42 sur 286
        </p>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full" style={{ width: "15%", background: "#D4AF37" }} />
        </div>
      </div>

      {/* Liste des sourates */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Sourates
        </p>
        <div className="flex flex-col gap-2">
          {SURAHS.map(({ number, name, arabic, verses }) => (
            <div
              key={number}
              className="flex items-center gap-4 rounded-xl border px-4 py-3 transition-all active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
              >
                {number}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {name}
                </p>
                <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {verses} versets
                </p>
              </div>
              <p className="text-base" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                {arabic}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
