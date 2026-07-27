"use client";

import { useState } from "react";
import { Post, Reaction, REACTIONS } from "@/lib/types";
import { timeAgo } from "@/lib/time";

export default function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact: (id: string, r: Reaction) => void;
}) {
  const [burst, setBurst] = useState<Reaction | null>(null);

  const total = REACTIONS.reduce((n, r) => n + (post.reactions[r] ?? 0), 0);

  function handle(r: Reaction) {
    onReact(post.id, r);
    if (post.mine !== r) {
      setBurst(r);
      setTimeout(() => setBurst(null), 700);
    }
  }

  return (
    <article className="animate-pop mx-auto max-w-xl px-4">
      <div className="rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl"
            style={{ background: `${post.author.color}22` }}
          >
            {post.author.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-bold">{post.author.name}</span>
              <span className="truncate text-xs text-muted">
                @{post.author.handle}
              </span>
            </div>
            <span className="text-xs text-muted">{timeAgo(post.createdAt)}</span>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-sm"
            style={{ background: `${post.author.color}1a` }}
          >
            {post.vibe}
          </span>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
          {post.text}
        </p>

        <div className="mt-4 flex items-center gap-1.5">
          {REACTIONS.map((r) => {
            const count = post.reactions[r] ?? 0;
            const active = post.mine === r;
            return (
              <button
                key={r}
                onClick={() => handle(r)}
                className={`relative flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-sm transition active:scale-90 ${
                  active
                    ? "border-grape bg-grape/15"
                    : "border-line hover:border-muted"
                }`}
              >
                <span>{r}</span>
                {count > 0 && (
                  <span className="text-xs tabular-nums text-muted">
                    {count}
                  </span>
                )}
                {burst === r && (
                  <span className="animate-heart pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg">
                    {r}
                  </span>
                )}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-muted">
            {total > 0 ? `${total}件の反応` : "最初の反応を"}
          </span>
        </div>
      </div>
    </article>
  );
}
