"use client";

import { Notif } from "@/lib/seed";
import { timeAgo } from "@/lib/time";

const ICON: Record<Notif["kind"], string> = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
};

export default function Inbox({
  notifs,
  onOpenProfile,
}: {
  notifs: Notif[];
  onOpenProfile: (h: string) => void;
}) {
  return (
    <div className="h-dvh overflow-y-auto bg-black pb-24">
      <div className="sticky top-0 z-10 bg-black/90 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))] text-center font-bold backdrop-blur">
        受信箱
      </div>

      {notifs.length === 0 ? (
        <p className="py-20 text-center text-sm text-white/40">
          通知はまだないよ
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          {notifs.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => onOpenProfile(n.author.handle)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-white/5"
              >
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-xl">
                  {n.author.avatar}
                  <span className="absolute -bottom-1 -right-1 text-sm">
                    {ICON[n.kind]}
                  </span>
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold">{n.author.name}</span>
                  <span className="text-white/80">{n.text}</span>
                </div>
                <span className="shrink-0 text-[11px] text-white/40">
                  {timeAgo(n.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
