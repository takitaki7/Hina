"use client";

import { useEffect, useRef, useState } from "react";
import { Clip, Pulse } from "@/lib/types";
import ClipCard from "./ClipCard";

const TABS = [
  { icon: "🏠", label: "ホーム" },
  { icon: "🔍", label: "さがす" },
  { icon: "📥", label: "受信箱" },
  { icon: "🫧", label: "プロフィール" },
];

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
  const firstId = clips[0]?.id ?? "";

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

  // 投稿・先頭削除で先頭クリップが変わったら頭出し
  useEffect(() => {
    if (!firstId) return;
    containerRef.current?.scrollTo({ top: 0 });
    setActiveId(firstId);
  }, [firstId]);

  return (
    <div className="relative h-dvh bg-black">
      {/* 上部タブ */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex items-center justify-center gap-5 pt-[max(20px,env(safe-area-inset-top))] text-[15px]">
        <span className="font-medium text-white/60">フォロー中</span>
        <span className="font-bold">おすすめ</span>
        <span className="pointer-events-auto absolute right-4 text-xl">🔍</span>
      </div>

      {/* フィード */}
      <div
        ref={containerRef}
        className="no-scrollbar h-dvh snap-y snap-mandatory overflow-y-scroll overscroll-y-none"
      >
        {clips.length === 0 ? (
          <div className="grid h-dvh place-items-center px-10 text-center">
            <div>
              <div className="mb-4 text-6xl">🎬</div>
              <p className="mb-6 text-sm text-white/70">
                まだ何もないよ。
                <br />
                最初の5秒を撮ってみて
              </p>
              <button
                onClick={onCreate}
                className="rounded-full bg-white px-6 py-3 text-sm font-black text-black transition active:scale-90"
              >
                5秒とる
              </button>
            </div>
          </div>
        ) : (
          clips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              active={clip.id === activeId}
              onLike={onLike}
              onPulse={onPulse}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* 下部タブバー（TikTok風） */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/85 px-2 pt-2 backdrop-blur-xl pb-[max(8px,env(safe-area-inset-bottom))]">
        <button className="flex flex-col items-center gap-0.5 text-[10px] font-medium">
          <span className="text-xl">{TABS[0].icon}</span>
          {TABS[0].label}
        </button>
        <button className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white/55">
          <span className="text-xl">{TABS[1].icon}</span>
          {TABS[1].label}
        </button>

        {/* 中央の作成ボタン */}
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

        <button className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white/55">
          <span className="text-xl">{TABS[2].icon}</span>
          {TABS[2].label}
        </button>
        <button className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white/55">
          <span className="text-xl">{TABS[3].icon}</span>
          {TABS[3].label}
        </button>
      </nav>
    </div>
  );
}
