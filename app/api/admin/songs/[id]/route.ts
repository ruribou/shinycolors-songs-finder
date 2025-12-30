import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnits, getVibeTags } from "@/lib/queries";
import type { SongWithRelations, VibeTag, Unit } from "@/lib/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: song, error } = await supabase
    .from("songs")
    .select(`
      *,
      units:song_units(unit:units(*)),
      member:members(*),
      vibe_tags:song_vibe_tags(vibe_tag:vibe_tags(*))
    `)
    .eq("id", id)
    .single();

  if (error || !song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  const songWithRelations: SongWithRelations = {
    ...song,
    units:
      song.units
        ?.map((su: { unit: Unit }) => su.unit)
        .filter((u: Unit | null): u is Unit => u !== null) ?? [],
    vibe_tags:
      song.vibe_tags?.map((svt: { vibe_tag: VibeTag }) => svt.vibe_tag) ?? [],
  } as SongWithRelations;

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("sort_order");

  const [units, vibeTags] = await Promise.all([getUnits(), getVibeTags()]);

  return NextResponse.json({
    song: songWithRelations,
    units,
    vibeTags,
    members: members ?? [],
  });
}
