"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Clip } from "@/lib/types";
import { SEED_NOTIFS } from "@/lib/seed";
import { putBlob } from "@/lib/db";
import Feed from "./Feed";
import Recorder from "./Recorder";
import BottomNav, { Screen } from "./BottomNav";
import CommentsSheet from "./CommentsSheet";
import Profile from "./Profile";
import Discover from "./Discover";
import Inbox from "./Inbox";

export default function HinaApp() {
  const app = useApp();
  const [screen, setScreen] = useState<Screen>("home");
  const [recording, setRecording] = useState(false);
  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [profileHandle, setProfileHandle] = useState<string | null>(null);
  const [startClipId, setStartClipId] = useState<string | undefined>(undefined);

  const commentClip = app.clips.find((c) => c.id === commentsId) ?? null;

  async function handlePost(clip: Clip, blob: Blob) {
    try {
      await putBlob(clip.id, blob);
    } catch {
      /* IndexedDB 不可でもメタは保存 */
    }
    app.addClip(clip);
    setRecording(false);
    setStartClipId(clip.id);
    setScreen("home");
  }

  function openProfile(handle: string) {
    setProfileHandle(handle);
    setScreen("profile");
  }

  function openClipInFeed(id: string) {
    setStartClipId(id);
    setScreen("home");
  }

  // プロフィール表示: BottomNav の「プロフィール」は自分、フィード等からは対象ユーザー
  const shownProfile =
    screen === "profile" ? (profileHandle ?? app.me.handle) : null;

  return (
    <>
      {screen === "home" && (
        <Feed
          clips={app.clips}
          me={app.me}
          follows={app.follows}
          savedIds={app.saved}
          startClipId={startClipId}
          onLike={app.toggleLike}
          onPulse={app.addPulse}
          onToggleFollow={app.toggleFollow}
          onToggleSave={app.toggleSave}
          onOpenComments={setCommentsId}
          onOpenProfile={openProfile}
          onDelete={app.removeClip}
          onCreate={() => setRecording(true)}
          onDiscover={() => setScreen("discover")}
        />
      )}

      {screen === "discover" && (
        <Discover
          clips={app.clips}
          onOpenClip={openClipInFeed}
          onOpenProfile={openProfile}
        />
      )}

      {screen === "inbox" && (
        <Inbox notifs={SEED_NOTIFS} onOpenProfile={openProfile} />
      )}

      {screen === "profile" && shownProfile && (
        <Profile
          handle={shownProfile}
          clips={app.clips}
          me={app.me}
          follows={app.follows}
          savedIds={app.saved}
          isOwn={shownProfile === app.me.handle}
          onBack={() => setScreen("home")}
          onOpenClip={openClipInFeed}
          onToggleFollow={app.toggleFollow}
          onEditMe={app.updateMe}
        />
      )}

      <BottomNav
        active={screen}
        onNavigate={(s) => {
          if (s === "profile") setProfileHandle(app.me.handle);
          setScreen(s);
        }}
        onCreate={() => setRecording(true)}
        inboxBadge={SEED_NOTIFS.length}
      />

      {recording && (
        <Recorder
          me={app.me}
          onClose={() => setRecording(false)}
          onPost={handlePost}
        />
      )}

      {commentClip && (
        <CommentsSheet
          clip={commentClip}
          onClose={() => setCommentsId(null)}
          onAdd={(text) => app.addComment(commentClip.id, text)}
          onLikeComment={(cid) => app.toggleCommentLike(commentClip.id, cid)}
        />
      )}
    </>
  );
}
