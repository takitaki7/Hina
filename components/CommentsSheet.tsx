"use client";

import { useState } from "react";
import { Clip } from "@/lib/types";
import { timeAgo } from "@/lib/time";

export default function CommentsSheet({
  clip,
  onClose,
  onAdd,
  onLikeComment,
}: {
  clip: Clip;
  onClose: () => void;
  onAdd: (text: string) => void;
  onLikeComment: (commentId: string) => void;
}) {
  const [text, setText] = useState("");

  function send() {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      {/* 背景 */}
      <button
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div className="spring-in relative flex max-h-[75vh] flex-col rounded-t-3xl bg-[#161620]">
        <div className="relative flex items-center justify-center border-b border-white/10 py-3">
          <span className="absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25" />
          <span className="text-sm font-bold">
            コメント {clip.comments.length}件
          </span>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-4 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-3">
          {clip.comments.length === 0 ? (
            <p className="py-12 text-center text-sm text-white/50">
              最初のコメントを書こう
            </p>
          ) : (
            <ul className="space-y-4">
              {clip.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg">
                    {c.author.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-white/60">
                      {c.author.name}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-[14px] leading-snug">
                      {c.text}
                    </p>
                    <div className="mt-1 text-[11px] text-white/40">
                      {timeAgo(c.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => onLikeComment(c.id)}
                    className="flex flex-col items-center gap-0.5 text-white/60 transition active:scale-90"
                  >
                    <span className="text-base">{c.liked ? "❤️" : "🤍"}</span>
                    {c.likes > 0 && (
                      <span className="text-[10px] tabular-nums">{c.likes}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            maxLength={200}
            placeholder="コメントを追加..."
            className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm outline-none placeholder:text-white/40"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="rounded-full bg-[#ff2d55] px-4 py-2.5 text-sm font-bold transition active:scale-90 disabled:opacity-30"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
