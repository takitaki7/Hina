export type Vibe = "🔥" | "🫶" | "😭" | "✨" | "💤" | "🧃";

export const VIBES: { key: Vibe; label: string }[] = [
  { key: "🔥", label: "アガる" },
  { key: "🫶", label: "すき" },
  { key: "😭", label: "エモい" },
  { key: "✨", label: "神" },
  { key: "💤", label: "ねむい" },
  { key: "🧃", label: "まったり" },
];

export type Reaction = "❤️" | "😂" | "🥹" | "🔥" | "👀";

export const REACTIONS: Reaction[] = ["❤️", "😂", "🥹", "🔥", "👀"];

export interface User {
  handle: string;
  name: string;
  avatar: string; // emoji
  color: string; // hex accent
}

export interface Post {
  id: string;
  author: User;
  text: string;
  vibe: Vibe;
  createdAt: number;
  reactions: Record<Reaction, number>;
  // 自分が押したリアクション（ローカル状態）
  mine?: Reaction | null;
}
