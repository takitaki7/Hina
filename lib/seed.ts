import { Author, Clip } from "./types";

export const ME: Author = { handle: "you", name: "きみ", avatar: "🫧" };

const s = 1000;
const now = Date.now();

/**
 * ばらけたリアクション（0..5秒）を作る。
 * 乱数を使うと SSR とクライアントで DOM が食い違いハイドレーション不一致に
 * なるため、決定論的にばらけさせる。
 */
function pulses(spec: [number, string, number][]): Clip["pulses"] {
  const out: Clip["pulses"] = [];
  for (const [t, emoji, n] of spec) {
    for (let i = 0; i < n; i++) {
      const jitter = (i / Math.max(1, n) - 0.5) * 0.6; // -0.3..0.3
      out.push({ t: Math.max(0, Math.min(5, t + jitter)), emoji });
    }
  }
  return out;
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
  },
];

export const REACTION_EMOJIS = ["🔥", "🫶", "😭", "✨", "🥹"];
