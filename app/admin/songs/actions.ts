"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { SongType, Song, AttributeType } from "@/lib/types/database";
import { canPublishSong } from "@/lib/types/database";

interface SongInput {
  title: string;
  unit_id: string | null;
  member_id: string | null;
  song_type: SongType;
  attribute: AttributeType | null;
  youtube_url: string | null;
  vibe_tag_ids: string[];
}

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createSong(input: SongInput): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { vibe_tag_ids, ...songData } = input;

  const { data: song, error: songError } = await supabase
    .from("songs")
    .insert(songData)
    .select("id")
    .single();

  if (songError) {
    console.error("Failed to create song:", songError);
    return { success: false, error: "楽曲の作成に失敗しました" };
  }

  if (vibe_tag_ids.length > 0) {
    const { error: tagError } = await supabase.from("song_vibe_tags").insert(
      vibe_tag_ids.map((tag_id) => ({
        song_id: song.id,
        vibe_tag_id: tag_id,
      }))
    );

    if (tagError) {
      console.error("Failed to add vibe tags:", tagError);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/songs");

  return { success: true };
}

export async function updateSong(
  id: string,
  input: SongInput
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { vibe_tag_ids, ...songData } = input;

  const { error: songError } = await supabase
    .from("songs")
    .update(songData)
    .eq("id", id);

  if (songError) {
    console.error("Failed to update song:", songError);
    return { success: false, error: "楽曲の更新に失敗しました" };
  }

  // タグを一度削除して再追加
  await supabase.from("song_vibe_tags").delete().eq("song_id", id);

  if (vibe_tag_ids.length > 0) {
    const { error: tagError } = await supabase.from("song_vibe_tags").insert(
      vibe_tag_ids.map((tag_id) => ({
        song_id: id,
        vibe_tag_id: tag_id,
      }))
    );

    if (tagError) {
      console.error("Failed to add vibe tags:", tagError);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/songs");

  return { success: true };
}

export async function deleteSong(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  await supabase.from("song_vibe_tags").delete().eq("song_id", id);

  const { error } = await supabase.from("songs").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete song:", error);
    return { success: false, error: "楽曲の削除に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/admin/songs");

  return { success: true };
}

export async function togglePublishSong(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: song, error: fetchError } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !song) {
    return { success: false, error: "楽曲が見つかりません" };
  }

  if (!song.is_published && !canPublishSong(song as Song)) {
    return {
      success: false,
      error: "公開に必要な項目が未設定です（YouTube URL必須、コラボ曲以外はユニットか属性が必須、ソロ曲はメンバー必須）",
    };
  }

  const { error } = await supabase
    .from("songs")
    .update({ is_published: !song.is_published })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle publish:", error);
    return { success: false, error: "公開状態の変更に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/admin/songs");

  return { success: true };
}
