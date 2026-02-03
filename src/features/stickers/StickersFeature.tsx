"use client";

import React from 'react';
import { StickerLibrary } from '@/components/stickers/StickerLibrary';

export const StickersFeature = () => {
  return (
    <div className="min-h-screen bg-white pb-32">
      <StickerLibrary />
    </div>
  );
};