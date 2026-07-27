import { Author, Clip, Comment, UserProfile } from "./types";

export const ME: Author = { handle: "you", name: "きみ", avatar: "🫧" };

/** 既知ユーザーのプロフィール（ハンドル → プロフィール） */
export const USERS: Record<string, UserProfile> = {
  you: { handle: "you", name: "きみ", avatar: "🫧", bio: "5秒で世界を切り取る", followers: 128 },
  mikan: { handle: "mikan", name: "みかん", avatar: "🍊", bio: "スニーカーと音楽🎧", followers: 24800 },
  "rui.mp3": { handle: "rui.mp3", name: "るい", avatar: "🎧", bio: "深夜に生きてる", followers: 9120 },
  hiro_: { handle: "hiro_", name: "ひろ", avatar: "🛹", bio: "スケートと空", followers: 5340 },
  "nao.zzz": { handle: "nao.zzz", name: "なお", avatar: "🐑", bio: "睡眠は正義", followers: 1870 },
};

export function userOf(handle: string): UserProfile {
  return (
    USERS[handle] ?? {
      handle,
      name: handle,
      avatar: "🫥",
      bio: "",
      followers: 0,
    }
  );
}

const s = 1000;
const now = Date.now();

/** 決定論的にばらけたリアクション（0..5秒）。SSR不一致を避けるため乱数を使わない */
function pulses(spec: [number, string, number][]): Clip["pulses"] {
  const out: Clip["pulses"] = [];
  for (const [t, emoji, n] of spec) {
    for (let i = 0; i < n; i++) {
      const jitter = (i / Math.max(1, n) - 0.5) * 0.6;
      out.push({ t: Math.max(0, Math.min(5, t + jitter)), emoji });
    }
  }
  return out;
}

function cmt(
  handle: string,
  text: string,
  agoSec: number,
  likes = 0,
): Comment {
  const u = userOf(handle);
  return {
    id: `c_${handle}_${agoSec}`,
    author: { handle: u.handle, name: u.name, avatar: u.avatar },
    text,
    createdAt: now - agoSec * s,
    likes,
  };
}

export const SEED_CLIPS: Clip[] = [
  {
    id: "seed_hype",
    kind: "motion",
    author: { handle: "mikan", name: "みかん", avatar: "🍊" },
    caption: "新しいスニーカー、\n開封5秒でこの音出た",
    vibe: "hype",
    createdAt: now - 40000 * s,
    likes: 1240,
    pulses: pulses([
      [1.2, "🔥", 6],
      [3.8, "🔥", 14],
      [4.2, "🥹", 5],
    ]),
    comments: [
      cmt("rui.mp3", "音やば🔥どこの？", 800, 42),
      cmt("hiro_", "開封のテンポ最高", 500, 12),
      cmt("nao.zzz", "ほしい〜", 120, 3),
    ],
  },
  {
    id: "seed_emo",
    kind: "motion",
    author: { handle: "rui.mp3", name: "るい", avatar: "🎧" },
    caption: "終電の窓、\nこの曲がエモすぎた",
    vibe: "emo",
    createdAt: now - 3600 * s,
    likes: 862,
    pulses: pulses([
      [2.5, "😭", 10],
      [4.6, "🫶", 8],
    ]),
    comments: [cmt("mikan", "わかる、夜のこの感じ", 1200, 30)],
  },
  {
    id: "seed_divine",
    kind: "motion",
    author: { handle: "hiro_", name: "ひろ", avatar: "🛹" },
    caption: "テスト終わり、\n空を5秒だけ",
    vibe: "divine",
    createdAt: now - 7200 * s,
    likes: 431,
    pulses: pulses([
      [0.6, "✨", 5],
      [3.0, "✨", 9],
    ]),
    comments: [],
  },
  {
    id: "seed_chill",
    kind: "motion",
    author: { handle: "nao.zzz", name: "なお", avatar: "🐑" },
    caption: "湯船に沈む5秒、\nこれが優勝",
    vibe: "chill",
    createdAt: now - 18000 * s,
    likes: 158,
    pulses: pulses([[2.0, "🧃", 6]]),
    comments: [cmt("hiro_", "整いそう♨️", 4000, 8)],
  },
];

export const REACTION_EMOJIS = ["🔥", "🫶", "😭", "✨", "🥹"];

export interface Notif {
  id: string;
  kind: "like" | "comment" | "follow";
  author: Author;
  text: string;
  createdAt: number;
}

export const SEED_NOTIFS: Notif[] = [
  {
    id: "n1",
    kind: "follow",
    author: { handle: "mikan", name: "みかん", avatar: "🍊" },
    text: "があなたをフォローしました",
    createdAt: now - 300 * s,
  },
  {
    id: "n2",
    kind: "like",
    author: { handle: "rui.mp3", name: "るい", avatar: "🎧" },
    text: "があなたのクリップにいいねしました",
    createdAt: now - 3600 * s,
  },
  {
    id: "n3",
    kind: "comment",
    author: { handle: "hiro_", name: "ひろ", avatar: "🛹" },
    text: "がコメントしました：「これ好き」",
    createdAt: now - 9000 * s,
  },
];
