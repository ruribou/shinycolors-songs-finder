"use client";

import { useFilterState } from "@/lib/hooks/useFilterState";
import { useSongsQuery, useSongCountsQuery } from "@/lib/hooks/useSongsQuery";
import type { Unit, VibeTag, AttributeType } from "@/lib/types/database";
import { UnitSelector } from "./UnitSelector";
import { AttributeSelector } from "./AttributeSelector";
import { VibeTagSelector } from "./VibeTagSelector";
import { SongList } from "./SongList";

interface SongFinderClientProps {
  initialUnits: Unit[];
  initialVibeTags: VibeTag[];
}

export function SongFinderClient({
  initialUnits,
  initialVibeTags,
}: SongFinderClientProps) {
  const {
    unitSlug,
    attribute,
    vibeTagSlugs,
    toggleUnit,
    toggleAttribute,
    toggleVibeTag,
    clearFilters,
  } = useFilterState();

  const filters = {
    unitSlug: unitSlug ?? undefined,
    attribute: attribute ?? undefined,
    vibeTagSlugs: vibeTagSlugs.length > 0 ? vibeTagSlugs : undefined,
  };

  const {
    data: songs = [],
    isLoading: isInitialLoading,
    isFetching,
  } = useSongsQuery(filters);

  const { data: counts } = useSongCountsQuery(filters);

  const defaultCounts: {
    units: Record<string, number>;
    attributes: Record<AttributeType, number>;
    vibeTags: Record<string, number>;
  } = {
    units: {},
    attributes: { stella: 0, luna: 0, sol: 0 },
    vibeTags: {},
  };

  const hasActiveFilters =
    unitSlug !== null || attribute !== null || vibeTagSlugs.length > 0;

  return (
    <div className="space-y-6">
      <UnitSelector
        units={initialUnits}
        counts={counts?.units ?? defaultCounts.units}
        selectedSlug={unitSlug}
        onSelect={toggleUnit}
      />

      <AttributeSelector
        counts={counts?.attributes ?? defaultCounts.attributes}
        selectedAttribute={attribute}
        onSelect={toggleAttribute}
      />

      <VibeTagSelector
        vibeTags={initialVibeTags}
        counts={counts?.vibeTags ?? defaultCounts.vibeTags}
        selectedSlugs={vibeTagSlugs}
        onToggle={toggleVibeTag}
      />

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-shiny-blue-dark hover:text-shiny-blue"
        >
          フィルターをクリア
        </button>
      )}

      {isInitialLoading ? (
        <div className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-100 rounded-full w-16" />
                    <div className="h-6 bg-slate-100 rounded-full w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
        >
          <SongList songs={songs} />
        </div>
      )}
    </div>
  );
}
