"use client";

import { useQuery } from "@tanstack/react-query";
import { getSongs, getSongCounts, type SongFilters } from "@/lib/queries";

export function useSongsQuery(filters: SongFilters) {
  return useQuery({
    queryKey: ["songs", filters],
    queryFn: () => getSongs(filters),
  });
}

export function useSongCountsQuery(filters: SongFilters) {
  return useQuery({
    queryKey: ["songCounts", filters],
    queryFn: () => getSongCounts(filters),
  });
}
