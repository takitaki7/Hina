export type VibeKey = "hype" | "love" | "emo" | "divine" | "night" | "chill";

export interface Vibe {
  key: VibeKey;
  emoji: string;
  label: string;
  bg: string; // グラデーション
  aura: string;
}

export const VIBES: Record<VibeKey, Vibe> = {
  hype: {
    key: "hype",
    emoji: "🔥",
    label: "アガる",
    bg: "linear-gradient(150deg,#ff9d00,#ff3d6e 55%,#b5179e)",
    aura: "#ff5a3c",
  },
  love: {
    key: "love",
    emoji: "🫶",
    label: "すき",
    bg: "linear-gradient(150deg,#ff8fb1,#ff5fa2 45%,#7b2ff7)",
    aura: "#ff5fa2",
  },
  emo: {
    key: "emo",
    emoji: "😭",
    label: "エモい",
    bg: "linear-gradient(150deg,#4361ee,#7209b7 55%,#3a0ca3)",
    aura: "#6d5dfc",
  },
  divine: {
    key: "divine",
    emoji: "✨",
    label: "神",
    bg: "linear-gradient(150deg,#f9d423,#ff8c42 50%,#ff5fa2)",
    aura: "#ffcf3a",
  },
  night: {
    key: "night",
    emoji: "🌙",
    label: "よふかし",
    bg: "linear-gradient(150deg,#1e2a78,#4a2fbd 55%,#120b46)",
    aura: "#4a5bd4",
  },
  chill: {
    key: "chill",
    emoji: "🧃",
    label: "まったり",
    bg: "linear-gradient(150deg,#06d6a0,#1b9aaa 50%,#118ab2)",
    aura: "#0fd6a6",
  },
};

export const VIBE_LIST = Object.values(VIBES);

export interface Author {
  handle: string;
  name: string;
  avatar: string; // emoji
}

export interface UserProfile extends Author {
  bio: string;
  followers: number; // ベースのフォロワー数
}

export interface Comment {
  id: string;
  author: Author;
  text: string;
  createdAt: number;
  likes: number;
  liked?: boolean;
}

/** 5秒フォーマットに同期したリアクション（新要素 Pulse の実体） */
export interface Pulse {
  t: number; // 0..5 秒。押された瞬間の再生位置
  emoji: string;
}

export type ClipKind = "motion" | "video";

export interface Clip {
  id: string;
  kind: ClipKind;
  author: Author;
  caption: string;
  vibe: VibeKey; // motion の見た目 / video のアクセント
  createdAt: number;
  likes: number;
  liked?: boolean;
  pulses: Pulse[];
  comments: Comment[];
  /** kind === "video" のとき true。実データは IndexedDB (key = id) */
  hasBlob?: boolean;
}

export const CLIP_SECONDS = 5;
