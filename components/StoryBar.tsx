const STORIES = [
  { name: "あなた", avatar: "🫧", me: true, color: "#b8ff3a" },
  { name: "るい", avatar: "🎧", color: "#a855f7" },
  { name: "みかん", avatar: "🍊", color: "#ff5fa2" },
  { name: "ひろ", avatar: "🛹", color: "#38bdf8" },
  { name: "なお", avatar: "🐑", color: "#b8ff3a" },
  { name: "ここ", avatar: "🍡", color: "#ff5fa2" },
  { name: "そら", avatar: "🌈", color: "#38bdf8" },
];

export default function StoryBar() {
  return (
    <div className="no-scrollbar mx-auto flex max-w-xl gap-4 overflow-x-auto px-4 py-4">
      {STORIES.map((s) => (
        <button
          key={s.name}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5 transition active:scale-95"
        >
          <span
            className="grid h-16 w-16 place-items-center rounded-full text-2xl"
            style={{
              background: s.me
                ? "var(--color-surface-2)"
                : `conic-gradient(from 210deg, ${s.color}, #ff5fa2, #38bdf8, ${s.color})`,
              padding: 2,
            }}
          >
            <span className="grid h-full w-full place-items-center rounded-full bg-surface">
              {s.me ? "＋" : s.avatar}
            </span>
          </span>
          <span className="max-w-full truncate text-[11px] text-muted">
            {s.name}
          </span>
        </button>
      ))}
    </div>
  );
}
