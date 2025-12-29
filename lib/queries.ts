import { supabase } from "./supabase";
import type {
  Unit,
  VibeTag,
  SongWithRelations,
  AttributeType,
  Inquiry,
} from "./types/database";

export async function getUnits(): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getVibeTags(): Promise<VibeTag[]> {
  const { data, error } = await supabase
    .from("vibe_tags")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export interface SongFilters {
  unitSlug?: string;
  attribute?: AttributeType;
  vibeTagSlugs?: string[];
}

export async function getSongs(
  filters: SongFilters = {}
): Promise<SongWithRelations[]> {
  let query = supabase.from("songs").select(`
      *,
      unit:units(*),
      member:members(*),
      vibe_tags:song_vibe_tags(vibe_tag:vibe_tags(*))
    `);

  if (filters.unitSlug) {
    const { data: unit } = await supabase
      .from("units")
      .select("id")
      .eq("slug", filters.unitSlug)
      .single();
    if (unit) {
      query = query.eq("unit_id", unit.id);
    }
  }

  if (filters.attribute) {
    const { data: membersWithAttr } = await supabase
      .from("members")
      .select("id")
      .eq("attribute", filters.attribute);
    const memberIds = membersWithAttr?.map((m) => m.id) ?? [];
    query = query.or(
      `attribute.eq.${filters.attribute},member_id.in.(${memberIds.join(",")})`
    );
  }

  const { data, error } = await query.order("created_at");

  if (error) throw error;

  const songs = (data ?? []).map((song) => ({
    ...song,
    vibe_tags: song.vibe_tags?.map(
      (svt: { vibe_tag: VibeTag }) => svt.vibe_tag
    ) ?? [],
  })) as SongWithRelations[];

  if (filters.vibeTagSlugs && filters.vibeTagSlugs.length > 0) {
    return songs.filter((song) => {
      const songVibeTagSlugs = song.vibe_tags.map((vt) => vt.slug);
      return filters.vibeTagSlugs!.every((slug) =>
        songVibeTagSlugs.includes(slug)
      );
    });
  }

  return songs;
}

export interface CountResult {
  units: Record<string, number>;
  attributes: Record<AttributeType, number>;
  vibeTags: Record<string, number>;
  total: number;
}

export async function getSongCounts(
  filters: SongFilters = {}
): Promise<CountResult> {
  const { unitSlug, attribute, ...otherFilters } = filters;

  const [songsForUnits, songsForAttrs, filteredSongs] = await Promise.all([
    getSongs({ ...otherFilters, attribute }),
    getSongs({ ...otherFilters, unitSlug }),
    getSongs(filters),
  ]);

  const counts: CountResult = {
    units: {},
    attributes: { stella: 0, luna: 0, sol: 0 },
    vibeTags: {},
    total: filteredSongs.length,
  };

  for (const song of songsForUnits) {
    const slug = song.unit?.slug;
    if (slug) {
      counts.units[slug] = (counts.units[slug] ?? 0) + 1;
    }
  }

  for (const song of songsForAttrs) {
    const attr = song.attribute ?? song.member?.attribute;
    if (attr) {
      counts.attributes[attr]++;
    }
  }

  for (const song of filteredSongs) {
    for (const vibeTag of song.vibe_tags ?? []) {
      if (vibeTag.slug) {
        counts.vibeTags[vibeTag.slug] =
          (counts.vibeTags[vibeTag.slug] ?? 0) + 1;
      }
    }
  }

  return counts;
}

export async function getInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
