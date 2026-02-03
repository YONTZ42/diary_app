import React from 'react';

interface StickerTagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const StickerTagFilter: React.FC<StickerTagFilterProps> = ({
  tags,
  selectedTag,
  onSelectTag,
}) => {
  return (
    <div className="sticky top-0 z-10 w-full overflow-x-auto border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex space-x-2">
        <button
          onClick={() => onSelectTag(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedTag === null
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedTag === tag
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};