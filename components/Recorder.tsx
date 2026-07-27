"use client";

import { useEffect, useRef, useState } from "react";
import { Clip, CLIP_SECONDS, VibeKey, VIBE_LIST, VIBES } from "@/lib/types";
import { ME } from "@/lib/seed";

type Stage = "capture" | "review";

export default function Recorder({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (clip: Clip, blob: Blob) => void;
}) {
  const [stage, setStage] = useState<Stage>("capture");
  const [recording, setRecording] = useState(false);
  const [count, setCount] = useState(CLIP_SECONDS);
  const [camError, setCamError] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [vibe, setVibe] = useState<VibeKey>("hype");

  const liveRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hardStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  // レビュー用 object URL の後始末
  useEffect(() => {
    return () => {
      if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    };
  }, [reviewUrl]);

  // カメラ起動
  useEffect(() => {
    if (stage !== "capture") return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
      })
      .catch(() => setCamError(true));
    return () => {
      cancelled = true;
      stopStream();
      if (timer.current) clearInterval(timer.current);
      if (hardStop.current) clearTimeout(hardStop.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function pickMime() {
    const opts = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    return opts.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? "";
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunks.current = [];
    const mime = pickMime();
    const rec = new MediaRecorder(
      streamRef.current,
      mime ? { mimeType: mime } : undefined,
    );
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => {
      const b = new Blob(chunks.current, { type: mime || "video/webm" });
      finishCapture(b);
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    setCount(CLIP_SECONDS);
    // 5秒で確実に停止（表示用カウントとは分離）
    hardStop.current = setTimeout(stopRecording, CLIP_SECONDS * 1000);
    timer.current = setInterval(
      () => setCount((c) => Math.max(0, c - 1)),
      1000,
    );
  }

  function stopRecording() {
    if (timer.current) clearInterval(timer.current);
    if (hardStop.current) clearTimeout(hardStop.current);
    setRecording(false);
    if (recRef.current && recRef.current.state !== "inactive")
      recRef.current.stop();
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) finishCapture(f);
  }

  function finishCapture(b: Blob) {
    stopStream();
    setBlob(b);
    setReviewUrl(URL.createObjectURL(b));
    setStage("review");
  }

  function post() {
    if (!blob) return;
    const id = `clip_${Date.now()}`;
    const clip: Clip = {
      id,
      kind: "video",
      author: ME,
      caption: caption.trim() || "5秒の記録",
      vibe,
      createdAt: Date.now(),
      likes: 0,
      pulses: [],
      hasBlob: true,
    };
    onPost(clip, blob);
  }

  const v = VIBES[vibe];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
      <div className="relative h-full w-full overflow-hidden sm:h-[92vh] sm:w-auto sm:aspect-[9/16] sm:rounded-[2rem]">
        {stage === "capture" ? (
          <>
            {!camError ? (
              <video
                ref={liveRef}
                muted
                playsInline
                className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-neutral-800 to-black px-8 text-center">
                <div>
                  <div className="mb-3 text-5xl">🎬</div>
                  <p className="text-sm text-white/70">
                    カメラが使えないみたい。
                    <br />
                    動画をアップロードして5秒クリップを作ろう
                  </p>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-6">
              <button
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="text-xl transition active:scale-90"
              >
                ✕
              </button>
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur">
                最大 {CLIP_SECONDS} 秒
              </span>
              <label className="cursor-pointer rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition active:scale-90">
                アップ
                <input
                  type="file"
                  accept="video/*"
                  onChange={onUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 録画ボタン */}
            <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4">
              {recording && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-black tabular-nums">
                  ● {count}
                </span>
              )}
              {!camError && (
                <button
                  onClick={recording ? stopRecording : startRecording}
                  aria-label={recording ? "停止" : "録画"}
                  className="grid h-20 w-20 place-items-center rounded-full ring-4 ring-white transition active:scale-90"
                >
                  <span
                    className={
                      recording
                        ? "h-8 w-8 rounded-md bg-red-500"
                        : "h-16 w-16 rounded-full bg-red-500"
                    }
                  />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {reviewUrl && (
              <video
                src={reviewUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-6">
              <button
                onClick={() => {
                  setStage("capture");
                  setBlob(null);
                }}
                className="text-sm font-medium transition active:scale-90"
              >
                撮り直す
              </button>
              <button
                onClick={post}
                className="rounded-full bg-white px-5 py-1.5 text-sm font-bold text-black transition active:scale-90"
              >
                シェア
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-4 pb-8">
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={60}
                placeholder="キャプションを書く"
                className="mb-4 w-full rounded-2xl bg-black/40 px-4 py-3 text-sm outline-none backdrop-blur placeholder:text-white/50"
              />
              <div className="mb-2 text-xs font-semibold text-white/70">
                vibe
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {VIBE_LIST.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setVibe(item.key)}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs transition active:scale-90 ${
                      vibe === item.key
                        ? "bg-white text-black"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
              <div
                className="mt-3 h-1 w-full rounded-full"
                style={{ background: v.bg }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
