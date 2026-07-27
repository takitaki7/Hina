"use client";

import { useState } from "react";
import { Author, Clip, VIBES } from "@/lib/types";
import { userOf } from "@/lib/seed";

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function Grid({
  clips,
  onOpen,
  empty,
}: {
  clips: Clip[];
  onOpen: (id: string) => void;
  empty: string;
}) {
  if (clips.length === 0)
    return <p className="py-16 text-center text-sm text-white/40">{empty}</p>;
  return (
    <div className="grid grid-cols-3 gap-[3px]">
      {clips.map((c) => {
        const v = VIBES[c.vibe];
        return (
          <button
            key={c.id}
            onClick={() => onOpen(c.id)}
            className="relative aspect-[3/4] overflow-hidden"
            style={{ background: v.bg }}
          >
            <span className="absolute inset-0 grid place-items-center text-3xl opacity-90">
              {v.emoji}
            </span>
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[11px] font-semibold drop-shadow">
              ❤️ {fmt(c.likes)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function Profile({
  handle,
  clips,
  me,
  follows,
  savedIds,
  isOwn,
  onBack,
  onOpenClip,
  onToggleFollow,
  onEditMe,
}: {
  handle: string;
  clips: Clip[];
  me: Author;
  follows: string[];
  savedIds: string[];
  isOwn: boolean;
  onBack: () => void;
  onOpenClip: (id: string) => void;
  onToggleFollow: (h: string) => void;
  onEditMe: (patch: Partial<Author>) => void;
}) {
  const base = userOf(handle);
  const display = isOwn ? me : { ...base, name: base.name, avatar: base.avatar };
  const myClips = clips.filter((c) => c.author.handle === handle);
  const savedClips = clips.filter((c) => savedIds.includes(c.id));
  const totalLikes = myClips.reduce((n, c) => n + c.likes, 0);
  const followers = base.followers + (!isOwn && follows.includes(handle) ? 1 : 0);
  const following = follows.includes(handle);

  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(me.name);
  const [avatar, setAvatar] = useState(me.avatar);

  return (
    <div className="h-dvh overflow-y-auto bg-black pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 pt-[max(16px,env(safe-area-inset-top))]">
        {!isOwn ? (
          <button onClick={onBack} className="text-xl active:scale-90">
            ‹
          </button>
        ) : (
          <span className="w-6" />
        )}
        <span className="font-bold">
          {isOwn ? "@" + me.handle : "@" + handle}
        </span>
        <span className="w-6 text-right text-xl">{isOwn ? "≡" : "⋯"}</span>
      </div>

      {/* プロフィール */}
      <div className="flex flex-col items-center px-6 pt-4">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-white/10 text-5xl ring-2 ring-white/20">
          {display.avatar}
        </span>
        <div className="mt-3 text-lg font-bold">{display.name}</div>
        <div className="text-sm text-white/50">@{display.handle}</div>

        <div className="mt-4 flex items-center gap-7">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums">
              {isOwn ? follows.length : myClips.length}
            </div>
            <div className="text-xs text-white/50">
              {isOwn ? "フォロー中" : "投稿"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums">
              {fmt(followers)}
            </div>
            <div className="text-xs text-white/50">フォロワー</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums">
              {fmt(totalLikes)}
            </div>
            <div className="text-xs text-white/50">いいね</div>
          </div>
        </div>

        {base.bio && (
          <p className="mt-3 text-center text-sm text-white/80">{base.bio}</p>
        )}

        <div className="mt-4 w-full max-w-xs">
          {isOwn ? (
            <button
              onClick={() => {
                setName(me.name);
                setAvatar(me.avatar);
                setEditing(true);
              }}
              className="w-full rounded-lg border border-white/20 py-2 text-sm font-semibold transition active:scale-95"
            >
              プロフィールを編集
            </button>
          ) : (
            <button
              onClick={() => onToggleFollow(handle)}
              className={`w-full rounded-lg py-2 text-sm font-bold transition active:scale-95 ${
                following ? "border border-white/25" : "bg-[#ff2d55]"
              }`}
            >
              {following ? "フォロー中" : "フォロー"}
            </button>
          )}
        </div>
      </div>

      {/* タブ */}
      <div className="mt-5 flex border-b border-white/10">
        <button
          onClick={() => setTab("posts")}
          className={`flex-1 py-2.5 text-center text-lg ${tab === "posts" ? "border-b-2 border-white" : "opacity-50"}`}
        >
          ▦
        </button>
        {isOwn && (
          <button
            onClick={() => setTab("saved")}
            className={`flex-1 py-2.5 text-center text-lg ${tab === "saved" ? "border-b-2 border-white" : "opacity-50"}`}
          >
            🔖
          </button>
        )}
      </div>

      {tab === "posts" ? (
        <Grid clips={myClips} onOpen={onOpenClip} empty="まだ投稿がないよ" />
      ) : (
        <Grid clips={savedClips} onOpen={onOpenClip} empty="保存したクリップはここに" />
      )}

      {/* 編集モーダル */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setEditing(false)}
            aria-label="閉じる"
          />
          <div className="spring-in relative w-full max-w-sm rounded-t-3xl bg-[#161620] p-6 sm:rounded-3xl">
            <h3 className="mb-4 text-center font-bold">プロフィールを編集</h3>
            <label className="mb-1 block text-xs text-white/60">アイコン（絵文字）</label>
            <input
              value={avatar}
              onChange={(e) =>
                setAvatar(Array.from(e.target.value).slice(-1)[0] ?? "🫧")
              }
              className="mb-4 w-full rounded-xl bg-white/10 px-4 py-3 text-center text-2xl outline-none"
            />
            <label className="mb-1 block text-xs text-white/60">名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="mb-5 w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none"
            />
            <button
              onClick={() => {
                onEditMe({ name: name.trim() || me.name, avatar });
                setEditing(false);
              }}
              className="w-full rounded-full bg-white py-3 text-sm font-bold text-black transition active:scale-95"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
