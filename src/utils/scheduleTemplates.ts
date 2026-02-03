import { nanoid } from 'nanoid';

// Excalidrawの要素生成ヘルパー
const createLine = (x1: number, y1: number, x2: number, y2: number, options: any = {}) => ({
  type: "line",
  version: 1,
  versionNonce: 0,
  isDeleted: false,
  id: nanoid(),
  fillStyle: "hachure",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 0, // 直線的な罫線
  opacity: 100,
  angle: 0,
  x: x1,
  y: y1,
  width: Math.abs(x2 - x1),
  height: Math.abs(y2 - y1),
  seed: Math.random(),
  strokeColor: "#d1d5db", // gray-300
  points: [[0, 0], [x2 - x1, y2 - y1]],
  locked: true, // 背景としてロック
  ...options
});

const createText = (text: string, x: number, y: number, size: number = 30, options: any = {}) => {
const estimatedWidth = size * text.length * 1.5; // 少し大きめに確保
const estimatedHeight = size * 1.5;

    
return {
  type: "text",
  version: 1,
  versionNonce: 0,
  isDeleted: false,
  id: nanoid(),
  fillStyle: "hachure",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  angle: 0,
  x,
  y,
  text,
  fontSize: size,
  fontFamily: 3, // Cascadia (Monospace風)
  textAlign: "left",
  verticalAlign: "top",
  baseline: size,
  strokeColor: "#4b5563", // gray-600
  locked: true,

      // ★重要: 幅と高さを明示的に設定
    width: estimatedWidth,
    height: estimatedHeight,
    
    // コンテナテキストではないことを明示 (auto-resizeさせるため)
    containerId: null,
    originalText: text,
    ...options

}};

// キャンバスサイズ (PageCanvasPreviewの定数に合わせる)
const W = 900;
const H = 1200;
const MARGIN = 40;
const CONTENT_W = W - MARGIN * 2;

/**
 * 月間カレンダー (ブロック型) の生成
 */
export const generateMonthTemplate = (year: number, month: number) => {
  const elements = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDay = new Date(year, month - 1, 1).getDay(); // 0: Sun

  // 1. タイトル
  const title = `${year} / ${String(month).padStart(2, '0')}`;
  elements.push(createText(title, MARGIN, MARGIN, 48, { strokeColor: "#111827" }));

  // 2. 曜日ヘッダー
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const colWidth = CONTENT_W / 7;
  const headerY = MARGIN + 80;
  
  weekDays.forEach((day, i) => {
    elements.push(createText(day, MARGIN + colWidth * i + 10, headerY, 16, { 
      strokeColor: i === 0 ? "#ef4444" : "#6b7280" // 日曜は赤
    }));
  });

  // 3. グリッドと日付
  const gridStartY = headerY + 40;
  const rowHeight = (H - gridStartY - MARGIN) / 6; // 最大6週

  // 横線 (7本)
  for (let i = 0; i <= 6; i++) {
    const y = gridStartY + i * rowHeight;
    elements.push(createLine(MARGIN, y, MARGIN + CONTENT_W, y));
  }
  // 縦線 (8本)
  for (let i = 0; i <= 7; i++) {
    const x = MARGIN + i * colWidth;
    elements.push(createLine(x, gridStartY, x, gridStartY + 6 * rowHeight));
  }

  // 日付埋め
  let dayCounter = 1;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < startDay) continue;
      if (dayCounter > daysInMonth) break;

      const x = MARGIN + col * colWidth + 8;
      const y = gridStartY + row * rowHeight + 8;
      
      elements.push(createText(String(dayCounter), x, y, 20, {
        strokeColor: col === 0 ? "#ef4444" : "#374151"
      }));
      dayCounter++;
    }
  }

  return elements;
};

/**
 * 週間バーチカル (Vertical) の生成
 */
export const generateWeekTemplate = (date: Date) => {
  const elements = [];
  
  // その週の日曜日を特定
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);

  // 1. ヘッダー (Month info)
  const title = `Week of ${startOfWeek.toLocaleDateString()}`;
  elements.push(createText(title, MARGIN, MARGIN, 32, { strokeColor: "#111827" }));

  // 2. カラム設定
  const headerY = MARGIN + 60;
  const colWidth = CONTENT_W / 8; // 左端(Time) + 7日
  const gridStartY = headerY + 40;
  const gridBottomY = H - MARGIN;
  const gridH = gridBottomY - gridStartY;

  // 曜日・日付ヘッダー
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const label = `${weekDays[i]} ${d.getDate()}`;
    
    // 左端のカラムは時間軸なので +1 する
    const x = MARGIN + (i + 1) * colWidth + 10;
    elements.push(createText(label, x, headerY, 16, {
      strokeColor: i === 0 ? "#ef4444" : "#374151"
    }));
  }

  // 3. グリッド線
  // 横線 (時間軸: 6時〜24時 = 18区画)
  const hourStep = gridH / 18;
  for (let i = 0; i <= 18; i++) {
    const y = gridStartY + i * hourStep;
    const hour = 6 + i;
    
    // 時間ラベル
    if (i < 18) {
       elements.push(createText(`${hour}:00`, MARGIN, y + 5, 12, { strokeColor: "#9ca3af" }));
    }

    // 線
    elements.push(createLine(MARGIN + colWidth, y, MARGIN + CONTENT_W, y, { strokeColor: "#e5e7eb" }));
  }

  // 縦線
  for (let i = 0; i <= 8; i++) {
    const x = MARGIN + i * colWidth;
    elements.push(createLine(x, gridStartY, x, gridBottomY));
  }

  return elements;
};