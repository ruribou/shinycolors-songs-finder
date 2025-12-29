"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createVibeTag(name: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "");

  const { data: maxOrder } = await supabase
    .from("vibe_tags")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const newOrder = (maxOrder?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("vibe_tags").insert({
    name,
    slug,
    sort_order: newOrder,
  });

  if (error) {
    console.error("Failed to create vibe tag:", error);
    if (error.code === "23505") {
      return { success: false, error: "同じ名前のタグが既に存在します" };
    }
    return { success: false, error: "タグの作成に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/admin/vibe-tags");

  return { success: true };
}

export async function updateVibeTag(
  id: string,
  name: string,
  slug: string
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("vibe_tags")
    .update({ name, slug })
    .eq("id", id);

  if (error) {
    console.error("Failed to update vibe tag:", error);
    if (error.code === "23505") {
      return { success: false, error: "同じ名前またはslugのタグが既に存在します" };
    }
    return { success: false, error: "タグの更新に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/admin/vibe-tags");

  return { success: true };
}

export async function deleteVibeTag(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  await supabase.from("song_vibe_tags").delete().eq("vibe_tag_id", id);

  const { error } = await supabase.from("vibe_tags").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete vibe tag:", error);
    return { success: false, error: "タグの削除に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/admin/vibe-tags");

  return { success: true };
}
