"use client";

export type Screen = "home" | "discover" | "inbox" | "profile";

export default function BottomNav({
  active,
  onNavigate,
  onCreate,
  inboxBadge = 0,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
  onCreate: () => void;
  inboxBadge?: number;
}) {
  const item = (s: Screen, icon: string, label: string, badge = 0) => (
    <button
      onClick={() => onNavigate(s)}
      className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition active:scale-90 ${
        active === s ? "text-white" : "text-white/55"
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
      {badge > 0 && (
        <span className="absolute -right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff2d55] px-1 text-[9px] font-black text-white">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/85 px-2 pt-2 backdrop-blur-xl pb-[max(8px,env(safe-area-inset-bottom))]">
      {item("home", "🏠", "ホーム")}
      {item("discover", "🔍", "さがす")}
      <button
        onClick={onCreate}
        aria-label="5秒とる"
        className="relative grid h-8 w-12 place-items-center transition active:scale-90"
      >
        <span className="absolute inset-0 -left-1 rounded-xl bg-[#00f2ea]" />
        <span className="absolute inset-0 left-1 rounded-xl bg-[#ff2d55]" />
        <span className="relative grid h-8 w-12 place-items-center rounded-xl bg-white text-2xl font-black text-black">
          +
        </span>
      </button>
      {item("inbox", "📥", "受信箱", inboxBadge)}
      {item("profile", "🫧", "プロフィール")}
    </nav>
  );
}
