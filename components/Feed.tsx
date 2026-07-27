"use client";

import { useEffect, useRef, useState } from "react";
import { Author, Clip, Pulse } from "@/lib/types";
import ClipCard from "./ClipCard";

export default function Feed({
  clips,
  me,
  follows,
  savedIds,
  startClipId,
  onLike,
  onPulse,
  onToggleFollow,
  onToggleSave,
  onOpenComments,
  onOpenProfile,
  onDelete,
  onCreate,
  onDiscover,
}: {
  clips: Clip[];
  me: Author;
  follows: string[];
  savedIds: string[];
  startClipId?: string;
  onLike: (id: string) => void;
  onPulse: (id: string, p: Pulse) => void;
  onToggleFollow: (h: string) => void;
  onToggleSave: (id: string) => void;
  onOpenComments: (id: string) => void;
  onOpenProfile: (h: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onDiscover: () => void;
}) {
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const containerRef = useRef<HTMLDivElement>(null);
  const list =
    tab === "following"
      ? clips.filter(
          (c) => c.author.handle !== me.handle && follows.includes(c.author.handle),
        )
      : clips;
  const [activeId, setActiveId] = useState(startClipId ?? list[0]?.id ?? "");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const id = (e.target as HTMLElement).dataset.id;
            if (id) setActiveId(id);
          }
      },
      { root: el, threshold: [0.6] },
    );
    el.querySelectorAll("[data-id]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [list.length, tab]);

  // 指定クリップから開く
  useEffect(() => {
    if (!startClipId) return;
    const el = containerRef.current?.querySelector(
      `[data-id="${CSS.escape(startClipId)}"]`,
    );
    if (el) {
      (el as HTMLElement).scrollIntoView();
      setActiveId(startClipId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startClipId]);

  return (
    <div className="relative h-dvh bg-black">
      {/* 上部タブ */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-center gap-5 pt-[max(20px,env(safe-area-inset-top))] text-[15px]">
        <button
          onClick={() => setTab("following")}
          className={tab === "following" ? "font-bold" : "font-medium text-white/60"}
        >
          フォロー中
        </button>
        <span className="text-white/30">|</span>
        <button
          onClick={() => setTab("foryou")}
          className={tab === "foryou" ? "font-bold" : "font-medium text-white/60"}
        >
          おすすめ
        </button>
        <span className="pointer-events-auto absolute right-4 text-xl">🔍</span>
      </div>

      <div
        ref={containerRef}
        className="no-scrollbar h-dvh snap-y snap-mandatory overflow-y-scroll overscroll-y-none"
      >
        {list.length === 0 ? (
          <div className="grid h-dvh place-items-center px-10 text-center">
            <div>
              <div className="mb-4 text-6xl">🫥</div>
              <p className="mb-6 text-sm text-white/70">
                {tab === "following"
                  ? "フォロー中のクリップがまだないよ。\n気になる人をフォローしよう"
                  : "まだ何もないよ。最初の5秒を撮ってみて"}
              </p>
              <button
                onClick={tab === "following" ? onDiscover : onCreate}
                className="rounded-full bg-white px-6 py-3 text-sm font-black text-black transition active:scale-90"
              >
                {tab === "following" ? "さがす" : "5秒とる"}
              </button>
            </div>
          </div>
        ) : (
          list.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              active={clip.id === activeId}
              me={me}
              following={follows.includes(clip.author.handle)}
              saved={savedIds.includes(clip.id)}
              onLike={onLike}
              onPulse={onPulse}
              onToggleFollow={onToggleFollow}
              onToggleSave={onToggleSave}
              onOpenComments={onOpenComments}
              onOpenProfile={onOpenProfile}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
