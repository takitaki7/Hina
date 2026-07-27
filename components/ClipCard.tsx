"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clip, CLIP_SECONDS, Pulse, VIBES } from "@/lib/types";
import { REACTION_EMOJIS } from "@/lib/seed";
import { getBlob } from "@/lib/db";

interface Float {
  id: number;
  emoji: string;
  x: number;
  big?: boolean;
}

const BINS = 24;

export default function ClipCard({
  clip,
  active,
  onLike,
  onPulse,
  onDelete,
}: {
  clip: Clip;
  active: boolean;
  onLike: (id: string) => void;
  onPulse: (id: string, p: Pulse) => void;
  onDelete?: (id: string) => void;
}) {
  const vibe = VIBES[clip.vibe];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [head, setHead] = useState(0); // 0..5 再生位置
  const [floats, setFloats] = useState<Float[]>([]);
  const [muted, setMuted] = useState(true);
  const [heart, setHeart] = useState(false);

  const lastHead = useRef(0);
  const fid = useRef(0);
  const raf = useRef(0);

  // 動画Blobの読み込み
  useEffect(() => {
    if (clip.kind !== "video" || !clip.hasBlob) return;
    let u: string | null = null;
    let alive = true;
    getBlob(clip.id)
      .then((b) => {
        if (b && alive) {
          u = URL.createObjectURL(b);
          setUrl(u);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [clip.id, clip.kind, clip.hasBlob]);

  const spawn = (emoji: string, big = false) =>
    setFloats((f) => {
      const next = [
        ...f,
        { id: fid.current++, emoji, x: 4 + Math.random() * 40, big },
      ];
      return next.length > 28 ? next.slice(next.length - 28) : next;
    });

  // 再生ループ（アクティブなカードだけ）＋ Pulse を再生位置に同期して再現
  useEffect(() => {
    const v = videoRef.current;
    if (!active) {
      if (v) v.pause();
      return;
    }
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    let last = performance.now();
    let motionHead = 0;

    const tick = (now: number) => {
      let h: number;
      if (clip.kind === "video" && v) {
        if (v.currentTime >= CLIP_SECONDS) v.currentTime = 0;
        h = v.currentTime % CLIP_SECONDS;
      } else {
        motionHead = (motionHead + (now - last) / 1000) % CLIP_SECONDS;
        h = motionHead;
      }
      last = now;

      // lastHead..h の間にある Pulse を再現（ループ跨ぎ対応）
      const a = lastHead.current;
      const inRange = (t: number) =>
        h >= a ? t > a && t <= h : t > a || t <= h;
      for (const p of clip.pulses) if (inRange(p.t)) spawn(p.emoji);
      lastHead.current = h;

      setHead(h);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, clip.kind, clip.pulses]);

  // ハイプカーブ（どの秒で沸いたか）
  const bins = useMemo(() => {
    const arr = new Array(BINS).fill(0);
    for (const p of clip.pulses) {
      const i = Math.min(BINS - 1, Math.floor((p.t / CLIP_SECONDS) * BINS));
      arr[i]++;
    }
    const max = Math.max(1, ...arr);
    const peak = arr.indexOf(max);
    return { arr, max, peak };
  }, [clip.pulses]);

  function react(emoji: string) {
    onPulse(clip.id, { t: head, emoji });
    spawn(emoji, true);
  }

  function like() {
    if (!clip.liked) {
      setHeart(true);
      setTimeout(() => setHeart(false), 700);
    }
    onLike(clip.id);
  }

  return (
    <section
      data-id={clip.id}
      className="relative h-dvh w-full shrink-0 snap-start overflow-hidden bg-black"
    >
      {clip.kind === "video" && url ? (
        <video
          ref={videoRef}
          src={url}
          muted={muted}
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: vibe.bg }}>
          <div
            className={`absolute -top-1/3 left-1/2 h-[80%] w-[140%] -translate-x-1/2 rounded-full blur-3xl ${active ? "breathe" : ""}`}
            style={{ background: vibe.aura, opacity: 0.55 }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
        </div>
      )}

      {/* ダブルタップでいいね */}
      <button
        aria-label="いいね"
        onDoubleClick={like}
        className="absolute inset-0 z-0 h-full w-full cursor-default"
        tabIndex={-1}
      />

      {/* Pulse フロート */}
      {floats.map((f) => (
        <span
          key={f.id}
          onAnimationEnd={() =>
            setFloats((arr) => arr.filter((x) => x.id !== f.id))
          }
          className={`float-up pointer-events-none absolute bottom-40 z-10 ${f.big ? "text-5xl" : "text-3xl"}`}
          style={{ left: `${f.x}%` }}
        >
          {f.emoji}
        </span>
      ))}

      {heart && (
        <span className="ignite pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-8xl">
          ❤️
        </span>
      )}

      {/* 右のアクションレール */}
      <div className="absolute bottom-32 right-3 z-20 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center">
          <span className="mb-1 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl ring-2 ring-white/70 backdrop-blur">
            {clip.author.avatar}
          </span>
        </div>
        <button
          onClick={like}
          className="flex flex-col items-center gap-1 transition active:scale-90"
        >
          <span className={`text-3xl ${clip.liked ? "" : "grayscale"}`}>
            {clip.liked ? "❤️" : "🤍"}
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {clip.likes}
          </span>
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">👀</span>
          <span className="text-xs font-semibold tabular-nums">
            {clip.pulses.length}
          </span>
        </div>
        {onDelete && clip.author.handle === "you" && (
          <button
            onClick={() => onDelete(clip.id)}
            className="flex flex-col items-center gap-1 opacity-70 transition active:scale-90"
          >
            <span className="text-2xl">🗑️</span>
          </button>
        )}
        {clip.kind === "video" && url && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/30 text-lg backdrop-blur transition active:scale-90"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>

      {/* 本文 */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-6">
        {clip.kind === "motion" && (
          <div className="pointer-events-none mb-4 flex justify-center">
            <span className="spring-in text-6xl drop-shadow-lg">
              {vibe.emoji}
            </span>
          </div>
        )}

        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-bold">@{clip.author.handle}</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur">
            {vibe.emoji} {vibe.label}
          </span>
        </div>
        <p className="mb-4 max-w-[80%] whitespace-pre-wrap text-[15px] font-medium leading-snug drop-shadow">
          {clip.caption}
        </p>

        {/* 5秒バー + ハイプカーブ（新要素 Pulse） */}
        <div className="mb-4">
          <div className="mb-1 flex h-6 items-end gap-[2px]">
            {bins.arr.map((c, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${(c / bins.max) * 100}%`,
                  minHeight: c > 0 ? "3px" : "0px",
                  background:
                    i === bins.peak && c > 0
                      ? "#fff"
                      : "rgba(255,255,255,0.45)",
                  boxShadow:
                    i === bins.peak && c > 0 ? "0 0 8px #fff" : "none",
                }}
              />
            ))}
          </div>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${(head / CLIP_SECONDS) * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/60">
            <span className="tabular-nums">{head.toFixed(1)}s</span>
            <span>みんなが沸いた瞬間 ✦</span>
            <span>5.0s</span>
          </div>
        </div>

        {/* クイックリアクション */}
        <div className="glass flex items-center justify-around rounded-full px-2 py-2">
          {REACTION_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => react(e)}
              className="grid h-10 w-10 place-items-center rounded-full text-2xl transition active:scale-125"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
