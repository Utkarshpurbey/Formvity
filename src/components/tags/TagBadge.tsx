"use client";

import React from "react";
import type { Tag } from "../../api/types";
import { getTagBadgeStyle } from "../../lib/tagUtils";

export type TagBadgeProps = {
  tag: Tag;
  onRemove?: () => void;
  size?: "sm" | "md";
  showSource?: boolean;
  className?: string;
};

export function TagBadge({
  tag,
  onRemove,
  size = "md",
  showSource = true,
  className = "",
}: TagBadgeProps) {
  const style = getTagBadgeStyle(tag.hexCode);

  const isSmall = size === "sm";

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition ${
        isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: tag.hexCode }}
      />
      <span className="truncate max-w-[140px]">{tag.name}</span>

      {showSource && tag.source && tag.source !== "MANUAL" ? (
        <span
          className={`rounded font-semibold uppercase tracking-wider ${
            isSmall ? "px-1 text-[9px]" : "px-1 text-[10px]"
          } ${
            tag.source === "AI"
              ? "bg-purple-100 text-purple-700"
              : "bg-amber-100 text-amber-700"
          }`}
          title={`Source: ${tag.source}`}
        >
          {tag.source}
        </span>
      ) : null}

      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-current hover:bg-black/10 transition"
          aria-label={`Remove ${tag.name} tag`}
          title="Remove tag"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}
