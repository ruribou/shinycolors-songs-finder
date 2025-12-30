import Link from "next/link";
import { getUnits, getVibeTags } from "@/lib/queries";
import { SongTable } from "./SongTable";
import { createClient } from "@/lib/supabase/server";
import type { SongWithRelations, VibeTag, Unit } from "@/lib/types/database";

export const dynamic = "force-dynamic";

async function getAdminSongs(): Promise<SongWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select(`
      *,
      units:song_units(unit:units(*)),
      member:members(*),
      vibe_tags:song_vibe_tags(vibe_tag:vibe_tags(*))
    `)
    .order("created_at");

  if (error) throw error;

  return (data ?? []).map((song) => ({
    ...song,
    units:
      song.units
        ?.map((su: { unit: Unit }) => su.unit)
        .filter((u: Unit | null): u is Unit => u !== null) ?? [],
    vibe_tags:
      song.vibe_tags?.map((svt: { vibe_tag: VibeTag }) => svt.vibe_tag) ?? [],
  })) as SongWithRelations[];
}

async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export default async function AdminSongsPage() {
  const [songs, units, vibeTags, members] = await Promise.all([
    getAdminSongs(),
    getUnits(),
    getVibeTags(),
    getMembers(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href="/admin"
            className="text-shiny-blue-dark hover:text-shiny-blue text-sm"
          >
            管理画面に戻る
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">楽曲管理</h1>
              <p className="mt-1 text-sm text-slate-500">
                {songs.length}件の楽曲
              </p>
            </div>
          </div>
        </header>

        <SongTable
          songs={songs}
          units={units}
          vibeTags={vibeTags}
          members={members}
        />
      </div>
    </div>
  );
}
