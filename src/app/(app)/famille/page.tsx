const MEMBERS = [
  { name: "Papa",   initial: "P", color: "#055C3F" },
  { name: "Maman",  initial: "M", color: "#D4AF37" },
  { name: "Younes", initial: "Y", color: "#7B5EA7" },
  { name: "Aisha",  initial: "A", color: "#C0634E" },
];

const TASKS = [
  { text: "Réciter Al-Kahf",    member: "Tous",   done: false },
  { text: "Mémoriser Al-Mulk",  member: "Younes", done: true  },
  { text: "Sadaqa du vendredi", member: "Papa",   done: false },
  { text: "Cours d'arabe",      member: "Aisha",  done: true  },
];

export default function FamillePage() {
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Espace partagé
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Famille
        </h1>
      </div>

      {/* Membres */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Membres
        </p>
        <div className="flex gap-3">
          {MEMBERS.map(({ name, initial, color }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold"
                style={{ background: color, color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}
              >
                {initial}
              </div>
              <p className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {name}
              </p>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed text-xl"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "rgba(212,175,55,0.5)" }}
            >
              +
            </div>
            <p className="text-xs opacity-30" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Ajouter
            </p>
          </div>
        </div>
      </div>

      {/* Tâches */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Tâches de la semaine
        </p>
        <div className="flex flex-col gap-2">
          {TASKS.map(({ text, member, done }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: done ? "#055C3F" : "rgba(255,255,255,0.2)",
                  background: done ? "#055C3F" : "transparent",
                }}
              >
                {done && <span style={{ color: "#F8F4EC", fontSize: 10 }}>✓</span>}
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{
                    color: done ? "rgba(248,244,236,0.3)" : "#F8F4EC",
                    fontFamily: "var(--font-dm-sans)",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {text}
                </p>
              </div>
              <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {member}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
