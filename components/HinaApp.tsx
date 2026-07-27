"use client";

import { useState } from "react";
import { useClips } from "@/lib/store";
import { Clip } from "@/lib/types";
import { putBlob } from "@/lib/db";
import Feed from "./Feed";
import Recorder from "./Recorder";

export default function HinaApp() {
  const { clips, addClip, removeClip, toggleLike, addPulse } = useClips();
  const [recording, setRecording] = useState(false);

  async function handlePost(clip: Clip, blob: Blob) {
    try {
      await putBlob(clip.id, blob);
    } catch {
      /* IndexedDB 不可でもメタは保存（このセッション中は再生できないことがある） */
    }
    addClip(clip);
    setRecording(false);
  }

  return (
    <>
      <Feed
        clips={clips}
        onLike={toggleLike}
        onPulse={addPulse}
        onDelete={removeClip}
        onCreate={() => setRecording(true)}
      />
      {recording && (
        <Recorder onClose={() => setRecording(false)} onPost={handlePost} />
      )}
    </>
  );
}
