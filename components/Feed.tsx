"use client";

import { useEffect, useRef, useState } from "react";
import { Clip, Pulse } from "@/lib/types";
import ClipCard from "./ClipCard";

export default function Feed({
  clips,
  onLike,
  onPulse,
  onDelete,
  onCreate,
}: {
  clips: Clip[];
  onLike: (id: string) => void;
  onPulse: (id: string, p: Pulse) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(clips[0]?.id ?? "");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const id = (e.target as HTMLElement).dataset.id;
            if (id) setActiveId(id);
          }
        }
      },
      { root: el, threshold: [0.6] },
    );
    el.querySelectorAll("[data-id]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [clips.length]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar h-dvh snap-y snap-mandatory overflow-y-scroll overscroll-y-none"
    >
      {/* トップバー: ロゴ + 撮影ボタン */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pt-5">
        <span className="w-16" />
        <h1 className="pointer-events-none text-lg font-black lowercase tracking-tighter drop-shadow">
          <span className="grad-text">hina</span>
          <span className="ml-1 text-[10px] font-bold text-white/60">5s</span>
        </h1>
        <button
          onClick={onCreate}
          aria-label="5秒とる"
          className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-black shadow-lg shadow-black/30 transition active:scale-90"
        >
          <span>🎬</span>とる
        </button>
      </div>

      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          active={clip.id === activeId}
          onLike={onLike}
          onPulse={onPulse}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
