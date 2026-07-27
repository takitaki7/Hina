"use client";

import { usePosts } from "@/lib/store";
import Composer from "./Composer";
import PostCard from "./PostCard";
import StoryBar from "./StoryBar";

export default function Feed() {
  const { posts, ready, addPost, react } = usePosts();

  return (
    <div className="pb-8">
      <StoryBar />
      <Composer onPost={addPost} />

      <div className="mx-auto max-w-xl px-4 pt-6 pb-2">
        <span className="text-xs font-semibold tracking-wide text-muted">
          みんなのvibe
        </span>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onReact={react} />
        ))}
      </div>

      {ready && posts.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          まだ何もないよ。最初のvibeを置いてみて 🫧
        </p>
      )}
    </div>
  );
}
