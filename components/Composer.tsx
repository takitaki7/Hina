"use client";

import { useState } from "react";
import { Post, Vibe, VIBES } from "@/lib/types";
import { ME } from "@/lib/seed";

const MAX = 140;

export default function Composer({ onPost }: { onPost: (p: Post) => void }) {
  const [text, setText] = useState("");
  const [vibe, setVibe] = useState<Vibe>("🔥");
  const [focused, setFocused] = useState(false);

  const remaining = MAX - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0;

  function submit() {
    if (!canPost) return;
    onPost({
      id: `p_${Date.now()}`,
      author: ME,
      text: text.trim(),
      vibe,
      createdAt: Date.now(),
      reactions: { "❤️": 0, "😂": 0, "🥹": 0, "🔥": 0, "👀": 0 },
      mine: null,
    });
    setText("");
    setFocused(false);
  }

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-lg shadow-black/20">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-xl">
            {ME.avatar}
          </span>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              rows={focused || text ? 3 : 1}
              placeholder="いまの気分、どう？"
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted"
            />

            {(focused || text) && (
              <div className="animate-pop mt-2">
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {VIBES.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setVibe(v.key)}
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition active:scale-90 ${
                        vibe === v.key
                          ? "border-neon bg-neon/10 text-neon"
                          : "border-line text-muted"
                      }`}
                    >
                      <span className="text-sm">{v.key}</span>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {(focused || text) && (
          <div className="animate-pop mt-3 flex items-center justify-end gap-3 border-t border-line pt-3">
            <span
              className={`text-xs tabular-nums ${
                remaining < 0
                  ? "text-bubble"
                  : remaining < 20
                    ? "text-neon"
                    : "text-muted"
              }`}
            >
              {remaining}
            </span>
            <button
              onClick={submit}
              disabled={!canPost}
              className="rounded-full bg-neon px-5 py-2 text-sm font-bold text-bg transition active:scale-90 disabled:opacity-30"
            >
              置く
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
