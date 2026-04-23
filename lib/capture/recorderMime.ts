/**
 * MediaRecorder 用の MIME を選ぶ。Safari では WebM 再生ができないため MP4 を優先する。
 */
export function pickRecorderMimeType(): {
  mimeType: string;
  fileExt: ".mp4" | ".webm";
  contentType: string;
} {
  const candidates: { mime: string; ext: ".mp4" | ".webm"; ct: string }[] = [
    { mime: "video/mp4;codecs=avc1.42E01E", ext: ".mp4", ct: "video/mp4" },
    { mime: "video/mp4;codecs=avc1", ext: ".mp4", ct: "video/mp4" },
    { mime: "video/mp4", ext: ".mp4", ct: "video/mp4" },
    { mime: "video/webm;codecs=vp9", ext: ".webm", ct: "video/webm" },
    { mime: "video/webm;codecs=vp8", ext: ".webm", ct: "video/webm" },
    { mime: "video/webm", ext: ".webm", ct: "video/webm" },
  ];

  for (const { mime, ext, ct } of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return { mimeType: mime, fileExt: ext, contentType: ct };
    }
  }

  return { mimeType: "video/webm", fileExt: ".webm", contentType: "video/webm" };
}

export function inferVideoUploadMeta(blob: Blob): { fileExt: string; contentType: string } {
  const t = (blob.type || "").toLowerCase();
  if (t.includes("mp4") || t.includes("mpeg")) {
    return { fileExt: ".mp4", contentType: t.startsWith("video/") ? blob.type : "video/mp4" };
  }
  if (t.includes("quicktime") || t.includes("mov")) {
    return { fileExt: ".mov", contentType: t.startsWith("video/") ? blob.type : "video/quicktime" };
  }
  return { fileExt: ".webm", contentType: t.startsWith("video/") ? blob.type : "video/webm" };
}
