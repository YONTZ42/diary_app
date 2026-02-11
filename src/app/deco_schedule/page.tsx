"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { ScheduleNavigator, ViewMode } from '@/components/schedule/ScheduleNavigator';
import { ScheduleCanvasPreview } from '@/components/schedule/ScheduleCanvasPreview';
import { PageCanvasEditor } from '@/components/canvas/PageCanvasEditor';
import { generateMonthTemplate, generateWeekTemplate } from '@/utils/scheduleTemplates';
import { Schedule, ScheduleType } from '@/types/schema';
import {fetchSchedule, createSchedule, updateSchedule} from '@/services/api';
import { ScheduleEditor } from '@/components/schedule/ScheduleEditor';
import { S } from 'node_modules/framer-motion/dist/types.d-a9pt5qxk';
// 簡易DB (データ保持用)
const MOCK_DB: Record<string, Schedule> = {};


interface ScheduleFeatureProps {
  isActive: boolean;
}

export default function SchedulePage({ isActive }: ScheduleFeatureProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEditing, setIsEditing] = useState(false);
  
  // 表示用ページデータ
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  
  // トランジション用フック
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


  // 日付文字列生成ヘルパー
  const getStartDateStr = (date: Date, mode: ViewMode): string => {
    if (mode === 'month') {
      // 月初めの日付 "YYYY-MM-01"
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      // 週の開始日（日曜日） "YYYY-MM-DD"
      const day = date.getDay();
      const d = new Date(date);
      d.setDate(date.getDate() - day);
      return d.toISOString().split('T')[0];
    }
  };


  // データロード処理
  const loadData = async (date: Date, mode: ViewMode) => {
    setIsLoading(true);
    const startDate = getStartDateStr(date, mode);
    const type: ScheduleType = mode === 'month' ? 'monthly' : 'weekly';

    try {
      // APIから取得試行
      const existing = await fetchSchedule({ type, startDate });

      if (existing) {
        setCurrentSchedule(existing);
      } else {
        // データがない場合はテンプレートから新規作成（オンメモリ）
        const elements = mode === 'month' 
          ? generateMonthTemplate(date.getFullYear(), date.getMonth() + 1)
          : generateWeekTemplate(date);

        const tempSchedule: Schedule = {
          owner: "default-user", // 仮の所有者ID
          id: `temp-${startDate}`, // 一時ID
          type,
          startDate,
          title: mode === 'month' ? 'Monthly Plan' : 'Weekly Plan',
          sceneData: { elements, appState: { viewBackgroundColor: "#ffffff" , collaborators: new Map() } },
          assets: {},
          eventsData: {}, // 新機能: テキストリスト
          preview: undefined, // 任意
          schemaVersion: 1, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(),
          // usedStickerIds は Schedule型には含めない設計にした場合は削除
        };
        setCurrentSchedule(tempSchedule);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

   useEffect(() => {
    if (isActive) {
      // 1. データを再ロードする
      loadData(currentDate, viewMode);
      
      // 2. もしExcalidrawの描画崩れがひどいなら、強制再マウント用のキーを更新する
      setRefreshKey(prev => prev + 1);
    }
  }, [isActive]); // isActiveが変わったら実行

    useEffect(() => {
    loadData(currentDate, viewMode);
  }, [currentDate, viewMode]);


  // ナビゲーションハンドラ (useTransitionでラップ)
  const handleNavigate = (action: 'prev' | 'next' | 'today' | 'mode', payload?: any) => {
    startTransition(() => {
      let nextDate = new Date(currentDate);
      let nextMode = viewMode;

      if (action === 'prev') {
        if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() - 1);
        else nextDate.setDate(nextDate.getDate() - 7);
      } else if (action === 'next') {
        if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
        else nextDate.setDate(nextDate.getDate() + 7);
      } else if (action === 'today') {
        nextDate = new Date();
      } else if (action === 'mode') {
        nextMode = payload as ViewMode;
      }

      // 1. 日付/モード更新
      setCurrentDate(nextDate);
      setViewMode(nextMode);
    });
  };

      // 2. データロード
  const handleSave = async (updated: Partial<Schedule>) => {
    if (!currentSchedule) return;
    
    // 最新の状態をマージ
    const nextData = { ...currentSchedule, ...updated, updatedAt: new Date().toISOString() };
    
    // UIを即時更新 (Optimistic)
    setCurrentSchedule(nextData);
    setIsEditing(false);

    try {
      if (currentSchedule.id.startsWith('temp-')) {
        // 新規作成 (IDを除去して送信)
        const { id, ...postData } = nextData; 
        const created = await createSchedule(postData);
        setCurrentSchedule(created); // 正規のIDになったデータをセット
      } else {
        // 更新
        await updateSchedule(currentSchedule.id, nextData);
      }
    } catch (e) {
      console.error("Failed to save schedule", e);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-[#F2F0E9] pb-32">
      <ScheduleNavigator
        currentDate={currentDate} 
        viewMode={viewMode}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onViewChange={(m) => handleNavigate('mode', m)} 
        onToday={() => handleNavigate('today')}
        isLoading={isPending} // ローディング状態を渡す
      />

      <div className="flex-1 w-full relative p-4 md:p-6 overflow-hidden flex justify-center">
        <div className={`w-full max-w-[1000px] ...`}>
          {currentSchedule && (
             <ScheduleCanvasPreview 
               // ★重要: keyにrefreshKeyを含めることで、タブ切り替え時に強制再マウントさせる
               key={`${currentSchedule.id}-${refreshKey}`}
               schedule={currentSchedule} 
               onClick={() => setIsEditing(true)} 
             />
          )}
        </div>
      </div>


      {isEditing && currentSchedule && (
        <div className="fixed inset-0 z-[100] bg-white">
          <ScheduleEditor
            initialSchedule={currentSchedule} 
            onSave={(updated) => handleSave(updated as Partial<Schedule>)} 
            onClose={() => setIsEditing(false)} 
            focusTarget="canvas"
          />
        </div>
      )}
    </div>
  );
};