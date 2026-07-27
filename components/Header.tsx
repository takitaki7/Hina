export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-black tracking-tight">
          <span className="gradient-text">Hina</span>
          <span className="ml-1 align-super text-[10px] text-muted">beta</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="検索"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-lg transition active:scale-90"
          >
            🔍
          </button>
          <button
            aria-label="通知"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-lg transition active:scale-90"
          >
            🔔
          </button>
        </div>
      </div>
    </header>
  );
}
