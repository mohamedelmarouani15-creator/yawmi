const PRAYERS = [
  { name: "Fajr",    arabic: "الفجر",   time: "05:12", done: true  },
  { name: "Dohr",    arabic: "الظهر",   time: "12:48", done: true  },
  { name: "Asr",     arabic: "العصر",   time: "16:20", done: false, next: true },
  { name: "Maghrib", arabic: "المغرب",  time: "20:05", done: false },
  { name: "Icha",    arabic: "العشاء",  time: "21:40", done: false },
];

export default function PrieresPage() {
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Horaires du jour
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Prières
        </h1>
      </div>

      {/* Prochaine prière */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 text-center"
        style={{
          background: "linear-gradient(135deg, #055C3F 0%, #033d2a 100%)",
          boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
        }}
      >
        <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Prochaine prière
        </p>
        <p className="mt-2 text-4xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
          Asr
        </p>
        <p className="text-2xl font-semibold mt-1" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          16:20
        </p>
        <p className="mt-2 text-sm opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          dans 1h 43min
        </p>
      </div>

      {/* Liste des prières */}
      <div className="flex flex-col gap-2">
        {PRAYERS.map(({ name, arabic, time, done, next }) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-xl px-4 py-3.5 border"
            style={{
              background: next ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
              borderColor: next ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: done ? "#055C3F" : next ? "#D4AF37" : "rgba(255,255,255,0.15)" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: next ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {name}
                </p>
                <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-amiri)" }}>
                  {arabic}
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold" style={{ color: done ? "rgba(248,244,236,0.3)" : "#F8F4EC", fontFamily: "var(--font-dm-sans)", textDecoration: done ? "line-through" : "none" }}>
              {time}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
