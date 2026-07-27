import { Post, User } from "./types";

export const ME: User = {
  handle: "you",
  name: "きみ",
  avatar: "🫧",
  color: "#b8ff3a",
};

const emptyReactions = () => ({
  "❤️": 0,
  "😂": 0,
  "🥹": 0,
  "🔥": 0,
  "👀": 0,
});

const now = Date.now();
const min = 60 * 1000;

export const SEED_POSTS: Post[] = [
  {
    id: "s1",
    author: { handle: "rui.mp3", name: "るい", avatar: "🎧", color: "#a855f7" },
    text: "深夜のコンビニ、なんであんなに映画なんだろ 🌙",
    vibe: "😭",
    createdAt: now - 4 * min,
    reactions: { ...emptyReactions(), "🥹": 12, "❤️": 34 },
    mine: null,
  },
  {
    id: "s2",
    author: { handle: "mikan", name: "みかん", avatar: "🍊", color: "#ff5fa2" },
    text: "新しいイヤホン届いた〜〜低音やばい、一生聴いてられる",
    vibe: "🔥",
    createdAt: now - 22 * min,
    reactions: { ...emptyReactions(), "🔥": 21, "❤️": 9 },
    mine: null,
  },
  {
    id: "s3",
    author: { handle: "hiro_", name: "ひろ", avatar: "🛹", color: "#38bdf8" },
    text: "テスト終わった瞬間の空、優勝すぎる ✨",
    vibe: "✨",
    createdAt: now - 68 * min,
    reactions: { ...emptyReactions(), "❤️": 58, "😂": 4, "👀": 7 },
    mine: null,
  },
  {
    id: "s4",
    author: { handle: "nao.zzz", name: "なお", avatar: "🐑", color: "#b8ff3a" },
    text: "2度寝の権利、憲法で保障してほしい",
    vibe: "💤",
    createdAt: now - 3 * 60 * min,
    reactions: { ...emptyReactions(), "😂": 41, "❤️": 15 },
    mine: null,
  },
];
