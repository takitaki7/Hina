"use client";

import { useCallback, useEffect, useState } from "react";
import { Author, Clip, Comment, Pulse } from "./types";
import { ME, SEED_CLIPS } from "./seed";
import { delBlob } from "./db";

const CLIPS_KEY = "hina.clips.v1";
const SOCIAL_KEY = "hina.social.v1";

interface Social {
  follows: string[];
  saved: string[];
  me: Author;
}

const DEFAULT_SOCIAL: Social = { follows: [], saved: [], me: ME };

/* ---------- clips (metadata) ---------- */
function readClips(): Clip[] {
  if (typeof window === "undefined") return SEED_CLIPS;
  try {
    const raw = window.localStorage.getItem(CLIPS_KEY);
    if (!raw) return SEED_CLIPS;
    const parsed = JSON.parse(raw) as Clip[];
    if (!Array.isArray(parsed) || !parsed.length) return SEED_CLIPS;
    // 後方互換: comments が無い古いデータを補う
    return parsed.map((c) => ({ ...c, comments: c.comments ?? [] }));
  } catch {
    return SEED_CLIPS;
  }
}
function writeClips(clips: Clip[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIPS_KEY, JSON.stringify(clips));
  } catch {
    /* noop */
  }
}

/* ---------- social ---------- */
function readSocial(): Social {
  if (typeof window === "undefined") return DEFAULT_SOCIAL;
  try {
    const raw = window.localStorage.getItem(SOCIAL_KEY);
    if (!raw) return DEFAULT_SOCIAL;
    const p = JSON.parse(raw) as Partial<Social>;
    return {
      follows: p.follows ?? [],
      saved: p.saved ?? [],
      me: p.me ?? ME,
    };
  } catch {
    return DEFAULT_SOCIAL;
  }
}
function writeSocial(s: Social) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function useApp() {
  const [clips, setClips] = useState<Clip[]>(SEED_CLIPS);
  const [social, setSocial] = useState<Social>(DEFAULT_SOCIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setClips(readClips());
    setSocial(readSocial());
    setReady(true);
  }, []);

  const persistClips = useCallback((next: Clip[]) => {
    setClips(next);
    writeClips(next);
  }, []);
  const persistSocial = useCallback((next: Social) => {
    setSocial(next);
    writeSocial(next);
  }, []);

  /* clips */
  const addClip = useCallback(
    (clip: Clip) => persistClips([clip, ...readClips()]),
    [persistClips],
  );
  const removeClip = useCallback(
    (id: string) => {
      persistClips(readClips().filter((c) => c.id !== id));
      delBlob(id).catch(() => {});
    },
    [persistClips],
  );
  const toggleLike = useCallback(
    (id: string) => {
      persistClips(
        readClips().map((c) =>
          c.id === id
            ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
            : c,
        ),
      );
    },
    [persistClips],
  );
  const addPulse = useCallback(
    (id: string, pulse: Pulse) => {
      persistClips(
        readClips().map((c) => {
          if (c.id !== id) return c;
          const pulses = [...c.pulses, pulse];
          return {
            ...c,
            pulses: pulses.length > 300 ? pulses.slice(-300) : pulses,
          };
        }),
      );
    },
    [persistClips],
  );
  const addComment = useCallback(
    (id: string, text: string) => {
      const body = text.trim();
      if (!body) return;
      const me = readSocial().me;
      const comment: Comment = {
        id: `c_${Date.now()}`,
        author: me,
        text: body,
        createdAt: Date.now(),
        likes: 0,
      };
      persistClips(
        readClips().map((c) =>
          c.id === id ? { ...c, comments: [comment, ...c.comments] } : c,
        ),
      );
    },
    [persistClips],
  );
  const toggleCommentLike = useCallback(
    (clipId: string, commentId: string) => {
      persistClips(
        readClips().map((c) =>
          c.id !== clipId
            ? c
            : {
                ...c,
                comments: c.comments.map((cm) =>
                  cm.id === commentId
                    ? {
                        ...cm,
                        liked: !cm.liked,
                        likes: cm.likes + (cm.liked ? -1 : 1),
                      }
                    : cm,
                ),
              },
        ),
      );
    },
    [persistClips],
  );

  /* social */
  const toggleFollow = useCallback(
    (handle: string) => {
      const s = readSocial();
      const follows = s.follows.includes(handle)
        ? s.follows.filter((h) => h !== handle)
        : [...s.follows, handle];
      persistSocial({ ...s, follows });
    },
    [persistSocial],
  );
  const toggleSave = useCallback(
    (id: string) => {
      const s = readSocial();
      const saved = s.saved.includes(id)
        ? s.saved.filter((x) => x !== id)
        : [id, ...s.saved];
      persistSocial({ ...s, saved });
    },
    [persistSocial],
  );
  const updateMe = useCallback(
    (patch: Partial<Author>) => {
      const s = readSocial();
      persistSocial({ ...s, me: { ...s.me, ...patch } });
    },
    [persistSocial],
  );

  return {
    clips,
    ready,
    follows: social.follows,
    saved: social.saved,
    me: social.me,
    addClip,
    removeClip,
    toggleLike,
    addPulse,
    addComment,
    toggleCommentLike,
    toggleFollow,
    toggleSave,
    updateMe,
  };
}
