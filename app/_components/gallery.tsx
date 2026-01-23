"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Plus, Sparkles, X, ChevronLeft, ChevronRight, Edit3, Save, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";


type Issue = {
  id: string;
  number: string;
  title: string;
  coverUrl: string;
};

type Article = {
  id: string;
  date: number;
  imageUrl: string;
  title?: string;
  content?: string;
  color?: string;
  rating?: number;
  issueId?: string;
};
export const Gallery = ({
  issues,
  activeIssueId,
  highlightedIssueId,
  onSelectIssue,
}: {
  issues: Issue[];
  activeIssueId: string | null;
  highlightedIssueId: string | null;
  onSelectIssue: (id: string | null) => void;
}) => {
  const sortedIssues = [...issues].reverse();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="w-full h-[240px] px-8 overflow-x-auto no-scrollbar z-30 relative shrink-0 flex items-end pb-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectIssue(null);
      }}
    >
      <div className="flex gap-6 items-end min-w-max">
        {/* Create New Button - 控えめに、しかし機能的に */}
        <Link
              key={"../issue"}
              href={"../issue"}
            >
        <div className="relative w-[120px] h-[160px] flex-shrink-0 group flex flex-col items-center justify-center">
             <button 
                className="w-12 h-12 rounded-full border border-stone-300 text-stone-400 hover:text-red-700 hover:border-red-700 transition-all duration-300 flex items-center justify-center mb-2 group-hover:scale-110"
                onClick={(e) => { e.stopPropagation(); console.log("Create New"); }}
            >
                <Plus size={24} strokeWidth={1.5} />
            </button>
              
            <span className="text-[10px] text-stone-400 font-serif tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                New Issue
            </span>
        </div></Link>

        {/* Issues List - 物体感を出す */}
        {sortedIssues.map((issue) => {
          const isSelected = activeIssueId === issue.id;
          const isHighlighted = highlightedIssueId === issue.id;
          const isActiveVisual = isSelected || isHighlighted;
          const isOtherActive = (activeIssueId !== null && !isSelected) || (highlightedIssueId !== null && !isHighlighted);

          return (
            <motion.div
              key={issue.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIssue(isSelected ? null : issue.id);
              }}
              animate={{
                opacity: isOtherActive ? 0.3 : 1,
                y: isActiveVisual ? -12 : 0,
                scale: isActiveVisual ? 1.05 : 1,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={clsx(
                "relative w-[120px] h-[160px] cursor-pointer pointer-events-auto transition-all duration-500 shrink-0",
                // 写真のような白い縁取りと、深い影
                "bg-white p-1.5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)]",
                isActiveVisual ? "shadow-[0_25px_50px_-10px_rgba(185,28,28,0.25)] ring-1 ring-red-700/30" : ""
              )}
            >
              <div className="relative w-full h-full overflow-hidden bg-stone-100">
                <img src={issue.coverUrl} alt={issue.title} className="w-full h-full object-cover filter contrast-[1.05]" />
                
                {/* Glossy Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-50" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[8px] text-white/90 font-serif tracking-[0.2em] mb-1">NO.{issue.number}</p>
                  <h3 className="text-white font-serif text-xs leading-none tracking-wide">{issue.title}</h3>
                </div>
              </div>
              
              {/* Selection Marker - 赤いドットでミニマルに */}
              {isActiveVisual && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-700" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};