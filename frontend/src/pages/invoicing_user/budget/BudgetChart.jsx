import React, { useState } from "react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";

/**
 * BudgetChart - Custom SVG Donut & Pie Chart
 * Supports both miniature preview mode (for table rows / cards) and full interactive mode (for detailed report)
 */
export function BudgetChart({
  committedAmount = 0,
  achievedAmount = 0,
  size = 200,
  strokeWidth = 24,
  showLegend = true,
  showCenterLabel = true,
  interactive = true,
  className = "",
  compact = false
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const committed = Math.max(0, Number(committedAmount) || 0);
  const achieved = Math.max(0, Number(achievedAmount) || 0);
  const remaining = calculateAmountToAchieve(achieved, committed);
  const percent = calculateAchievedPercent(achieved, committed);

  // Determine status coloring
  const isOverBudget = achieved > committed && committed > 0;
  const isComplete = percent >= 100;

  // Chart geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Clamped percentage for the arc (0 to 100)
  const displayPct = Math.min(100, percent);
  const achievedStrokeLength = (displayPct / 100) * circumference;
  const remainingStrokeLength = circumference - achievedStrokeLength;

  // Palette:
  // Achieved: Emerald / Forest green for healthy progress, Rose if exceeded
  const achievedColor = isOverBudget ? "#dc2626" : percent >= 75 ? "#059669" : "#10b981";
  // Remaining / To Achieve: Warm stone / amber slate
  const remainingColor = isOverBudget ? "#f87171" : "#e5e1d8";

  // Compact Mode (for table preview cell)
  if (compact) {
    const miniSize = 42;
    const miniStroke = 6;
    const miniRadius = (miniSize - miniStroke) / 2;
    const miniCircumference = 2 * Math.PI * miniRadius;
    const miniAchievedLength = (displayPct / 100) * miniCircumference;

    return (
      <div
        className="relative inline-flex items-center justify-center group cursor-pointer"
        title={`Achieved: ${percent}% (${formatINR(achieved)} / ${formatINR(committed)})`}
      >
        <svg
          width={miniSize}
          height={miniSize}
          className="transform -rotate-90 transition-transform duration-300 group-hover:scale-110"
        >
          {/* Base background circle */}
          <circle
            cx={miniSize / 2}
            cy={miniSize / 2}
            r={miniRadius}
            fill="transparent"
            stroke="#f1ede5"
            strokeWidth={miniStroke}
          />
          {/* Achieved arc */}
          <circle
            cx={miniSize / 2}
            cy={miniSize / 2}
            r={miniRadius}
            fill="transparent"
            stroke={achievedColor}
            strokeWidth={miniStroke}
            strokeDasharray={`${miniAchievedLength} ${miniCircumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-[#342921]">
          {Math.round(percent)}%
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 filter drop-shadow-xs"
        >
          {/* Background circle (Remaining / Total Base) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={remainingColor}
            strokeWidth={hoveredSlice === "remaining" ? strokeWidth + 3 : strokeWidth}
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => interactive && setHoveredSlice("remaining")}
            onMouseLeave={() => interactive && setHoveredSlice(null)}
          />

          {/* Achieved Arc */}
          {committed > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={achievedColor}
              strokeWidth={hoveredSlice === "achieved" ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${achievedStrokeLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap={percent > 0 && percent < 100 ? "round" : "butt"}
              className="transition-all duration-700 ease-out cursor-pointer"
              onMouseEnter={() => interactive && setHoveredSlice("achieved")}
              onMouseLeave={() => interactive && setHoveredSlice(null)}
            />
          )}
        </svg>

        {/* Center content */}
        {showCenterLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredSlice === "achieved" ? (
              <>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
                  Achieved
                </span>
                <span className="text-xl font-bold text-[#211D19]">
                  {formatINR(achieved)}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {percent}%
                </span>
              </>
            ) : hoveredSlice === "remaining" ? (
              <>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                  To Achieve
                </span>
                <span className="text-xl font-bold text-[#211D19]">
                  {formatINR(remaining)}
                </span>
                <span className="text-xs text-[#716B63]">
                  {Math.max(0, 100 - percent)}% left
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#211D19] tracking-tight">
                  {percent}%
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#716B63] mt-0.5">
                  {isOverBudget ? "Exceeded" : isComplete ? "Achieved" : "Realized"}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend & Value Breakdown */}
      {showLegend && (
        <div className="w-full mt-5 pt-4 border-t border-[#e7e3da] grid grid-cols-2 gap-3 min-w-0">
          {/* Achieved Segment */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer min-w-0 ${
              hoveredSlice === "achieved"
                ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300"
                : "bg-[#faf8f4] border-[#e7e3da] hover:bg-emerald-50/40"
            }`}
            onMouseEnter={() => setHoveredSlice("achieved")}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center gap-1.5 mb-1 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: achievedColor }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B63] truncate">
                Achieved ({percent}%)
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#211D19] truncate" title={formatINR(achieved)}>
              {formatINR(achieved)}
            </p>
          </div>

          {/* Amount to Achieve Segment */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer min-w-0 ${
              hoveredSlice === "remaining"
                ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300"
                : "bg-[#faf8f4] border-[#e7e3da] hover:bg-amber-50/40"
            }`}
            onMouseEnter={() => setHoveredSlice("remaining")}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center gap-1.5 mb-1 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block bg-[#b8aba0] shrink-0"
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B63] truncate">
                To Achieve
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#625547] truncate" title={formatINR(remaining)}>
              {formatINR(remaining)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetChart;
