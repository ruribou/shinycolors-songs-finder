"use client";

import {
  IlluminationStars,
  LAntica,
  HokagoClimaxGirls,
  Alstroemeria,
  StrayLight,
  Noctchill,
  Shhis,
  Cometik,
  ShinyColors,
} from "shinycolors-icons";
import type { Unit } from "@/lib/types/database";

const unitIconMap: Record<string, React.FC<{ size?: number | string }>> = {
  "illumination-stars": IlluminationStars,
  lantica: LAntica,
  "houkago-climax-girls": HokagoClimaxGirls,
  alstroemeria: Alstroemeria,
  straylight: StrayLight,
  noctchill: Noctchill,
  shhis: Shhis,
  cometik: Cometik,
  shinycolors: ShinyColors,
};

interface UnitSelectorProps {
  units: Unit[];
  counts: Record<string, number>;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function UnitSelector({
  units,
  counts,
  selectedSlug,
  onSelect,
}: UnitSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-700 tracking-wide">
        ユニット
      </h2>
      <div className="flex flex-wrap gap-3">
        {units.map((unit) => {
          const Icon = unitIconMap[unit.slug];
          const count = counts[unit.slug] ?? 0;
          const isSelected = selectedSlug === unit.slug;

          return (
            <button
              key={unit.id}
              onClick={() => onSelect(unit.slug)}
              className={`
                flex items-center gap-3 px-5 py-3.5 rounded-2xl
                border-2 transition-all duration-200
                ${
                  isSelected
                    ? "bg-gradient-to-r from-shiny-blue/30 to-shiny-blue/20 border-shiny-blue shadow-md scale-105"
                    : "glass-card border-transparent hover:border-shiny-blue/50 hover:shadow-sm"
                }
              `}
            >
              {Icon ? (
                <div className={`flex items-center justify-center w-10 h-10 transition-transform duration-200 ${isSelected ? "scale-110" : ""}`}>
                  <Icon size={28} />
                </div>
              ) : (
                <span className="w-10 h-10 flex items-center justify-center text-sm font-bold bg-shiny-blue/20 text-shiny-blue-dark rounded-xl">
                  {unit.name.charAt(0)}
                </span>
              )}
              <span className={`text-base font-medium ${isSelected ? "text-shiny-blue-dark" : "text-slate-700"}`}>
                {unit.name}
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
