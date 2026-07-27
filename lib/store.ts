"use client";

import { useCallback, useEffect, useState } from "react";
import { Post, Reaction } from "./types";
import { SEED_POSTS } from "./seed";

const KEY = "hina.posts.v1";

/**
 * localStorage を使ったゼロコンフィグな永続化ストア。
 * バックエンド不要で Vercel にそのままデプロイできる。
 * 将来 DB (Vercel Postgres / KV 等) に差し替える場合は、
 * この読み書きだけを fetch("/api/posts") に置き換えればよい。
 */
function read(): Post[] {
  if (typeof window === "undefined") return SEED_POSTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED_POSTS;
    const parsed = JSON.parse(raw) as Post[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

function write(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(posts));
  } catch {
    /* quota 超過などは黙って無視 */
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosts(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Post[]) => {
    setPosts(next);
    write(next);
  }, []);

  const addPost = useCallback(
    (post: Post) => {
      persist([post, ...read()]);
    },
    [persist],
  );

  const react = useCallback(
    (postId: string, reaction: Reaction) => {
      const next = read().map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...p.reactions };
        // 既存の自分のリアクションを取り消す
        if (p.mine) reactions[p.mine] = Math.max(0, reactions[p.mine] - 1);
        let mine: Reaction | null = reaction;
        if (p.mine === reaction) {
          // 同じものを再タップ → 取り消し
          mine = null;
        } else {
          reactions[reaction] = (reactions[reaction] ?? 0) + 1;
        }
        return { ...p, reactions, mine };
      });
      persist(next);
    },
    [persist],
  );

  return { posts, ready, addPost, react };
}
