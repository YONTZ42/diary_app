"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useRef, useState } from "react";
import { exportToCanvas, exportToSvg } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <div style={{ padding: 16 }}>Loading…</div> }
);

/** blob -> dataURL */
async function blobToDataURL(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("FileReader failed"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

/** 画像URLをdataURL化（CORS回避したいなら /api/image-proxy を噛ませる） */
async function fetchImageAsDataURL(url: string): Promise<{ dataURL: string; mimeType: string }> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch background image: ${res.status}`);
  const blob = await res.blob();
  return { dataURL: await blobToDataURL(blob), mimeType: blob.type || "image/jpeg" };
}

/** contain描画（背景を切らずに収める） */
function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const ir = img.width / img.height;
  const cr = cw / ch;

  let dw = cw;
  let dh = ch;
  if (ir > cr) {
    // 画像の方が横長 → 幅に合わせて高さ縮める
    dh = cw / ir;
  } else {
    // 画像の方が縦長 → 高さに合わせて幅縮める
    dw = ch * ir;
  }
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** ダウンロード */
function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [busy, setBusy] = useState(false);

  // 背景画像（例：public/background.jpg か、プロキシ済みURL）
  // Unsplashなど外部は CORS で死ぬことがあるので、確実にするなら
  // "/api/image-proxy?url=" + encodeURIComponent(外部URL) を使うのが堅い。
  const backgroundUrl = "/background.jpg";

  const exportPngWithBackground = useCallback(async () => {
    if (!apiRef.current) return;
    setBusy(true);
    try {
      const api = apiRef.current;
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();

      // 1) Excalidraw を canvas に書き出し（透過前提）
      const exCanvas = await exportToCanvas({
        elements,
        appState: {
          ...appState,
          viewBackgroundColor: "transparent",
        },
        files,
        // ここで解像度を上げる（scale:2〜3くらい）
        getDimensions: (w: number, h: number) => ({ width: w, height: h, scale: 2 }),
      } as any);

      // 2) 背景を dataURL で取得（同一オリジン or プロキシ推奨）
      const { dataURL } = await fetchImageAsDataURL(backgroundUrl);

      // 3) 合成用キャンバス作成
      const out = document.createElement("canvas");
      out.width = exCanvas.width;
      out.height = exCanvas.height;

      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("2D context unavailable");

      // 4) 背景画像描画
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = dataURL;
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error("Failed to load bg image"));
      });

      // 背景の色を敷きたい場合（紙色など）
      ctx.fillStyle = "#f4f1ea";
      ctx.fillRect(0, 0, out.width, out.height);

      // 背景画像（contain）
      drawImageContain(ctx, bgImg, out.width, out.height);

      // 5) Excalidraw を上に合成
      ctx.drawImage(exCanvas, 0, 0);

      // 6) PNG出力
      const blob = await new Promise<Blob>((resolve, reject) => {
        out.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      downloadBlob(blob, "spread_with_bg.png");
    } finally {
      setBusy(false);
    }
  }, [backgroundUrl]);

  const exportSvgWithBackground = useCallback(async () => {
    if (!apiRef.current) return;
    setBusy(true);
    try {
      const api = apiRef.current;
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();

      // 1) Excalidraw を SVG に書き出し
      const svgEl = await exportToSvg({
        elements,
        appState: { ...appState, viewBackgroundColor: "transparent" },
        files,
      } as any);

      // 2) 背景画像を dataURL 化
      const { dataURL } = await fetchImageAsDataURL(backgroundUrl);

      // 3) SVGの先頭に背景 image を差し込む
      // exportToSvg の返す svgEl は <svg> 要素なので、その直下に <image> を prepend
      const svgNS = "http://www.w3.org/2000/svg";
      const image = document.createElementNS(svgNS, "image");
      image.setAttribute("href", dataURL);
      image.setAttribute("x", "0");
      image.setAttribute("y", "0");
      image.setAttribute("width", "100%");
      image.setAttribute("height", "100%");
      image.setAttribute("preserveAspectRatio", "xMidYMid meet");

      // 先頭に背景を入れる（最背面）
      svgEl.insertBefore(image, svgEl.firstChild);

      // 4) Blob化してダウンロード
      const svgText = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(blob, "spread_with_bg.svg");
    } finally {
      setBusy(false);
    }
  }, [backgroundUrl]);

  return (
    <div style={{ position: "relative", height: "100dvh", width: "100%" }}>
      {/* 背景（固定画像） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `url(${backgroundUrl}) center / contain no-repeat`,
          pointerEvents: "none",
        }}
      />

      {/* 操作レイヤー（Excalidraw） */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Excalidraw
          excalidrawAPI={(api) => (apiRef.current = api)}
          initialData={{
            appState: {
              viewBackgroundColor: "transparent",
            },
          }}
        />
      </div>

      {/* Exportボタン */}
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
        <button onClick={exportPngWithBackground} disabled={busy}>
          Export PNG (with BG)
        </button>
        <button onClick={exportSvgWithBackground} disabled={busy}>
          Export SVG (with BG)
        </button>
      </div>
    </div>
  );
}
