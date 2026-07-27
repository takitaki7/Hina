"use client";

import { useMemo, useState } from "react";
import { Clip, VIBES } from "@/lib/types";
import { USERS } from "@/lib/seed";

export default function Discover({
  clips,
  onOpenClip,
  onOpenProfile,
}: {
  clips: Clip[];
  onOpenClip: (id: string) => void;
  onOpenProfile: (h: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const users = useMemo(
    () =>
      query
        ? Object.values(USERS).filter(
            (u) =>
              u.handle.toLowerCase().includes(query) ||
              u.name.toLowerCase().includes(query),
          )
        : [],
    [query],
  );

  const results = useMemo(() => {
    const base = query
      ? clips.filter(
          (c) =>
            c.caption.toLowerCase().includes(query) ||
            c.author.handle.toLowerCase().includes(query) ||
            c.author.name.toLowerCase().includes(query),
        )
      : clips;
    return [...base].sort((a, b) => b.likes - a.likes);
  }, [clips, query]);

  return (
    <div className="h-dvh overflow-y-auto bg-black pb-24">
      <div className="sticky top-0 z-10 bg-black/90 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
          <span>🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ユーザーやキャプションを検索"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-white/50">
              ✕
            </button>
          )}
        </div>
      </div>

      {users.length > 0 && (
        <div className="px-4 pb-2 pt-1">
          <div className="mb-2 text-xs font-semibold text-white/50">
            ユーザー
          </div>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.handle}>
                <button
                  onClick={() => onOpenProfile(u.handle)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-2 text-left transition active:scale-[0.98]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">
                    {u.avatar}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-xs text-white/50">@{u.handle}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-3 pt-2">
        <div className="mb-2 px-1 text-xs font-semibold text-white/50">
          {query ? "クリップ" : "急上昇 🔥"}
        </div>
        {results.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40">
            見つからなかった
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {results.map((c) => {
              const v = VIBES[c.vibe];
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenClip(c.id)}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl text-left"
                  style={{ background: v.bg }}
                >
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-90">
                    {v.emoji}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="line-clamp-1 text-xs font-semibold drop-shadow">
                      {c.caption.replace(/\n/g, " ")}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                      <span>{c.author.avatar}</span>@{c.author.handle}
                    </div>
                  </div>
                  <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                    ❤️ {c.likes}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
