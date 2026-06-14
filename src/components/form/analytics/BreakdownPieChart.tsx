"use client";

import { useState } from "react";
import type { BreakdownItem } from "../../../api/types";
import { BREAKDOWN_CHART_COLORS } from "./chartColors";

type BreakdownPieChartProps = {
  items: BreakdownItem[];
  maxItems?: number;
  compact?: boolean;
};

const DEFAULT_SIZE = 152;
const COMPACT_SIZE = 108;
const CX_RATIO = 0.5;
const R_RATIO = 0.46;
const INNER_R_RATIO = 0.28;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(
  cx: number,
  cy: number,
  r: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, r, endAngle);
  const endOuter = polarToCartesian(cx, cy, r, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function PieDonut({
  size,
  slices,
  total,
  hoveredKey,
  onHover,
}: {
  size: number;
  slices: { item: BreakdownItem; path: string; color: string }[];
  total: number;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
}) {
  const cx = size * CX_RATIO;
  const cy = size * CX_RATIO;

  return (
    <div className="relative shrink-0" onMouseLeave={() => onHover(null)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution pie chart">
        {slices.map((slice) => {
          const isHovered = hoveredKey === slice.item.key;
          const isDimmed = hoveredKey !== null && !isHovered;
          return (
            <path
              key={slice.item.key}
              d={slice.path}
              fill={slice.color}
              className="cursor-pointer transition-all duration-150"
              style={{
                opacity: isDimmed ? 0.35 : 1,
                filter: isHovered ? "brightness(1.08)" : undefined,
              }}
              onMouseEnter={() => onHover(slice.item.key)}
            >
              <title>
                {slice.item.label}: {slice.item.count}
                {slice.item.percent > 0 ? ` (${slice.item.percent.toFixed(0)}%)` : ""}
              </title>
            </path>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-bold tabular-nums text-slate-900 ${size >= DEFAULT_SIZE ? "text-xl" : "text-base"}`}
        >
          {total}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Total</span>
      </div>
    </div>
  );
}

function PieLegend({
  slices,
  total,
  hoveredKey,
  onHover,
  compact,
}: {
  slices: { item: BreakdownItem; color: string }[];
  total: number;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
  compact?: boolean;
}) {
  const useGrid = slices.length >= 3;
  const textSize = compact || slices.length >= 6 ? "text-xs" : "text-sm";

  return (
    <ul
      className={`w-full min-w-0 ${useGrid ? "grid grid-cols-2 gap-x-3 gap-y-1.5" : "space-y-1.5"} ${
        slices.length > 6 ? "max-h-28 overflow-y-auto pr-1" : ""
      }`}
      onMouseLeave={() => onHover(null)}
    >
      {slices.map((slice) => {
        const pct =
          slice.item.percent > 0
            ? slice.item.percent
            : total > 0
              ? (slice.item.count / total) * 100
              : 0;
        const isHovered = hoveredKey === slice.item.key;
        const isDimmed = hoveredKey !== null && !isHovered;

        return (
          <li
            key={slice.item.key}
            className={`flex items-center gap-1.5 rounded px-0.5 transition-all duration-150 ${textSize} ${
              isDimmed ? "opacity-30" : "opacity-100"
            }`}
            onMouseEnter={() => onHover(slice.item.key)}
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span
              className={`min-w-0 flex-1 truncate ${isHovered ? "font-semibold text-slate-900" : "text-slate-700"}`}
              title={slice.item.label}
            >
              {slice.item.label}
            </span>
            <span
              className={`shrink-0 tabular-nums ${isHovered ? "font-semibold text-slate-800" : "text-slate-500"}`}
            >
              {pct.toFixed(0)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PieChartLayout({
  size,
  compact,
  slices,
  total,
  hoveredKey,
  onHover,
  singleItem,
}: {
  size: number;
  compact: boolean;
  slices: { item: BreakdownItem; path?: string; color: string }[];
  total: number;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
  singleItem?: boolean;
}) {
  const cx = size * CX_RATIO;
  const cy = size * CX_RATIO;
  const r = size * R_RATIO;
  const innerR = size * INNER_R_RATIO;

  return (
    <div className={`flex w-full flex-col ${compact ? "h-full min-h-[200px]" : ""}`}>
      <div
        className="flex w-full shrink-0 items-center justify-center"
        style={{ minHeight: compact ? size + 8 : size }}
      >
        {singleItem ? (
          <div className="relative shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution pie chart">
              <circle cx={cx} cy={cy} r={r} fill={slices[0]!.color} />
              <circle cx={cx} cy={cy} r={innerR} fill="white" />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`font-bold tabular-nums text-slate-900 ${size >= DEFAULT_SIZE ? "text-xl" : "text-base"}`}
              >
                {total}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Total</span>
            </div>
          </div>
        ) : (
          <PieDonut
            size={size}
            total={total}
            hoveredKey={hoveredKey}
            onHover={onHover}
            slices={slices as { item: BreakdownItem; path: string; color: string }[]}
          />
        )}
      </div>
      <div className={`w-full ${compact ? "mt-auto pt-3" : "mt-3"}`}>
        <PieLegend
          slices={slices}
          total={total}
          hoveredKey={hoveredKey}
          onHover={onHover}
          compact={compact}
        />
      </div>
    </div>
  );
}

export function BreakdownPieChart({ items, maxItems = 8, compact = false }: BreakdownPieChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const visible = items.slice(0, maxItems);
  const total = visible.reduce((sum, item) => sum + item.count, 0);
  const size = compact ? COMPACT_SIZE : DEFAULT_SIZE;
  const cx = size * CX_RATIO;
  const cy = size * CX_RATIO;
  const r = size * R_RATIO;
  const innerR = size * INNER_R_RATIO;

  if (visible.length === 0 || total === 0) {
    return null;
  }

  if (visible.length === 1) {
    const color = BREAKDOWN_CHART_COLORS[0]!;
    const item = visible[0]!;
    return (
      <PieChartLayout
        size={size}
        compact={compact}
        total={total}
        hoveredKey={hoveredKey}
        onHover={setHoveredKey}
        singleItem
        slices={[{ item, color }]}
      />
    );
  }

  let angle = 0;
  const slices = visible.map((item, index) => {
    const sweep = (item.count / total) * 360;
    const start = angle;
    angle += sweep;
    return {
      item,
      path: donutSlicePath(cx, cy, r, innerR, start, angle),
      color: BREAKDOWN_CHART_COLORS[index % BREAKDOWN_CHART_COLORS.length]!,
    };
  });

  return (
    <PieChartLayout
      size={size}
      compact={compact}
      total={total}
      hoveredKey={hoveredKey}
      onHover={setHoveredKey}
      slices={slices}
    />
  );
}
