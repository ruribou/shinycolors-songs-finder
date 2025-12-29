"use client";

import type { AttributeType } from "@/lib/types/database";

const attributes: { value: AttributeType; label: string; color: string }[] = [
  { value: "stella", label: "Stella", color: "bg-pink-500" },
  { value: "luna", label: "Luna", color: "bg-blue-500" },
  { value: "sol", label: "Sol", color: "bg-yellow-500" },
];

interface AttributeSelectorProps {
  counts: Record<AttributeType, number>;
  selectedAttribute: AttributeType | null;
  onSelect: (attr: AttributeType) => void;
}

export function AttributeSelector({
  counts,
  selectedAttribute,
  onSelect,
}: AttributeSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-700 tracking-wide">
        属性
      </h2>
      <div className="flex flex-wrap gap-3">
        {attributes.map(({ value, label, color }) => {
          const count = counts[value] ?? 0;
          const isSelected = selectedAttribute === value;

          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-2xl
                border-2 transition-all duration-200
                ${
                  isSelected
                    ? "bg-gradient-to-r from-shiny-blue/30 to-shiny-blue/20 border-shiny-blue shadow-md scale-105"
                    : "glass-card border-transparent hover:border-shiny-blue/50 hover:shadow-sm"
                }
              `}
            >
              <span className={`w-5 h-5 rounded-full ${color} shadow-sm`} />
              <span className={`text-base font-medium ${isSelected ? "text-shiny-blue-dark" : "text-slate-700"}`}>
                {label}
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                isSelected
                  ? "bg-shiny-blue text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
