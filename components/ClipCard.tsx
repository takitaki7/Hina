"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clip, CLIP_SECONDS, Pulse, VIBES } from "@/lib/types";
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
  const [head, setHead] = useState(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const [muted, setMuted] = useState(true);
  const [heart, setHeart] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");

  const lastHead = useRef(0);
  const fid = useRef(0);
  const raf = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      return next.length > 24 ? next.slice(next.length - 24) : next;
    });

  // 再生ループ（アクティブ かつ 再生中のみ）＋ Pulse を再生位置に同期して再現
  useEffect(() => {
    const v = videoRef.current;
    if (!active || paused) {
      if (v) v.pause();
      return;
    }
    if (v) v.play().catch(() => {});
    let last = performance.now();
    let motionHead = lastHead.current;
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
  }, [active, paused, clip.kind, clip.pulses]);

  // 非アクティブになったら頭出し
  useEffect(() => {
    if (!active) {
      lastHead.current = 0;
      setHead(0);
      setPaused(false);
      const v = videoRef.current;
      if (v) v.currentTime = 0;
    }
  }, [active]);

  const bins = useMemo(() => {
    const arr = new Array(BINS).fill(0);
    for (const p of clip.pulses) {
      const i = Math.min(BINS - 1, Math.floor((p.t / CLIP_SECONDS) * BINS));
      arr[i]++;
    }
    const max = Math.max(1, ...arr);
    return { arr, max };
  }, [clip.pulses]);

  function like() {
    if (!clip.liked) {
      setHeart(true);
      setTimeout(() => setHeart(false), 700);
      spawn("❤️", true);
      onPulse(clip.id, { t: head, emoji: "❤️" }); // いいねした瞬間を刻む
    }
    onLike(clip.id);
  }

  // シングルタップ=一時停止 / ダブルタップ=いいね
  function onTap() {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      like();
    } else {
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
        setPaused((p) => !p);
      }, 240);
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: "hina",
      text: `${clip.caption}（@${clip.author.handle}）`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      return; // ユーザーがキャンセル
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("リンクをコピーしました");
    } catch {
      flash("共有はこの環境では利用できません");
    }
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  const railBtn =
    "flex flex-col items-center gap-0.5 transition active:scale-90";

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
            className={`absolute -top-1/3 left-1/2 h-[80%] w-[140%] -translate-x-1/2 rounded-full blur-3xl ${active && !paused ? "breathe" : ""}`}
            style={{ background: vibe.aura, opacity: 0.55 }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-90 drop-shadow-lg">
            {vibe.emoji}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        </div>
      )}

      {/* タップ領域（シングル=停止 / ダブル=いいね） */}
      <button
        aria-label="再生・一時停止"
        onClick={onTap}
        className="absolute inset-0 z-0 h-full w-full cursor-default"
        tabIndex={-1}
      />

      {/* 一時停止インジケータ */}
      {paused && active && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="spring-in grid h-20 w-20 place-items-center rounded-full bg-black/40 text-4xl backdrop-blur">
            ▶️
          </span>
        </div>
      )}

      {/* Pulse フロート */}
      {floats.map((f) => (
        <span
          key={f.id}
          onAnimationEnd={() =>
            setFloats((arr) => arr.filter((x) => x.id !== f.id))
          }
          className={`float-up pointer-events-none absolute bottom-48 z-10 ${f.big ? "text-5xl" : "text-3xl"}`}
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

      {/* トースト */}
      {toast && (
        <div className="spring-in pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium backdrop-blur">
          {toast}
        </div>
      )}

      {/* 右アクションレール */}
      <div className="absolute right-2.5 z-20 flex flex-col items-center gap-5 bottom-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="relative mb-1">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl ring-2 ring-white backdrop-blur">
            {clip.author.avatar}
          </span>
          <span className="absolute -bottom-2 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-[#ff2d55] text-xs font-black text-white">
            +
          </span>
        </div>

        <button onClick={like} className={railBtn} aria-label="いいね">
          <span className="text-[34px] leading-none">
            {clip.liked ? "❤️" : "🤍"}
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {clip.likes}
          </span>
        </button>

        <div className={railBtn} title="Pulse（沸いた反応の数）">
          <span className="text-[30px] leading-none">⚡</span>
          <span className="text-xs font-semibold tabular-nums">
            {clip.pulses.length}
          </span>
        </div>

        <button
          onClick={() => setSaved((s) => !s)}
          className={railBtn}
          aria-label="保存"
        >
          <span className="text-[30px] leading-none">
            {saved ? "🔖" : "🏷️"}
          </span>
          <span className="text-xs font-semibold">保存</span>
        </button>

        <button onClick={share} className={railBtn} aria-label="シェア">
          <span className="text-[30px] leading-none">↗️</span>
          <span className="text-xs font-semibold">シェア</span>
        </button>

        {onDelete && clip.author.handle === "you" ? (
          <button
            onClick={() => onDelete(clip.id)}
            className={railBtn}
            aria-label="削除"
          >
            <span className="text-2xl leading-none opacity-80">🗑️</span>
          </button>
        ) : (
          <span
            className="spin-slow grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-neutral-700 to-black text-lg ring-2 ring-black/40"
            style={{ animationPlayState: active && !paused ? "running" : "paused" }}
          >
            {vibe.emoji}
          </span>
        )}

        {clip.kind === "video" && url && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-base backdrop-blur transition active:scale-90"
            aria-label={muted ? "ミュート解除" : "ミュート"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>

      {/* 左下: ユーザー・キャプション・サウンド */}
      <div className="absolute inset-x-0 z-20 pl-3 pr-20 bottom-[calc(72px+env(safe-area-inset-bottom))]">
        <div className="mb-1.5 text-base font-bold drop-shadow">
          @{clip.author.handle}
        </div>
        <p className="mb-2 line-clamp-2 whitespace-pre-wrap text-[14px] leading-snug drop-shadow">
          {clip.caption}
        </p>
        <div className="flex items-center gap-1.5 text-[12px] text-white/90 drop-shadow">
          <span>🎵</span>
          <span className="truncate">オリジナル楽曲 · {clip.author.name}</span>
        </div>
      </div>

      {/* 最下部: 極細シークバー + さりげない Pulse ピーク */}
      <div className="absolute inset-x-0 z-20 px-3 bottom-[calc(60px+env(safe-area-inset-bottom))]">
        <div className="relative h-[2.5px] w-full rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${(head / CLIP_SECONDS) * 100}%` }}
          />
          {bins.arr.map((c, i) =>
            c > 0 ? (
              <span
                key={i}
                className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white"
                style={{
                  left: `${(i / (BINS - 1)) * 100}%`,
                  opacity: 0.35 + (c / bins.max) * 0.65,
                  boxShadow:
                    c === bins.max
                      ? "0 0 6px 1px rgba(255,255,255,0.9)"
                      : "none",
                }}
              />
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
