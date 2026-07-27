const TABS = [
  { icon: "🏠", label: "ホーム", active: true },
  { icon: "🔎", label: "みつける" },
  { icon: "✚", label: "" },
  { icon: "💬", label: "トーク" },
  { icon: "🫧", label: "じぶん" },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-around px-4 py-2">
        {TABS.map((t, i) =>
          t.icon === "✚" ? (
            <button
              key={i}
              aria-label="投稿"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-bubble via-grape to-sky text-xl font-bold text-white shadow-lg shadow-grape/30 transition active:scale-90"
            >
              ✚
            </button>
          ) : (
            <button
              key={i}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition active:scale-90 ${
                t.active ? "text-ink" : "text-muted"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ),
        )}
      </div>
    </nav>
  );
}
