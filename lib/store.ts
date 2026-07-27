"use client";

import { useCallback, useEffect, useState } from "react";
import { Clip, Pulse } from "./types";
import { SEED_CLIPS } from "./seed";
import { delBlob } from "./db";

const KEY = "hina.clips.v1";

function read(): Clip[] {
  if (typeof window === "undefined") return SEED_CLIPS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED_CLIPS;
    const parsed = JSON.parse(raw) as Clip[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_CLIPS;
  } catch {
    return SEED_CLIPS;
  }
}

function write(clips: Clip[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(clips));
  } catch {
    /* noop */
  }
}

export function useClips() {
  const [clips, setClips] = useState<Clip[]>(SEED_CLIPS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setClips(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Clip[]) => {
    setClips(next);
    write(next);
  }, []);

  const addClip = useCallback(
    (clip: Clip) => persist([clip, ...read()]),
    [persist],
  );

  const removeClip = useCallback(
    (id: string) => {
      persist(read().filter((c) => c.id !== id));
      delBlob(id).catch(() => {});
    },
    [persist],
  );

  const toggleLike = useCallback(
    (id: string) => {
      persist(
        read().map((c) =>
          c.id === id
            ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
            : c,
        ),
      );
    },
    [persist],
  );

  /** Pulse を追加（押した秒数に固定） */
  const addPulse = useCallback(
    (id: string, pulse: Pulse) => {
      persist(
        read().map((c) => {
          if (c.id !== id) return c;
          const pulses = [...c.pulses, pulse];
          // localStorage 肥大を防ぐため上限を設ける
          return {
            ...c,
            pulses: pulses.length > 300 ? pulses.slice(-300) : pulses,
          };
        }),
      );
    },
    [persist],
  );

  return { clips, ready, addClip, removeClip, toggleLike, addPulse };
}
