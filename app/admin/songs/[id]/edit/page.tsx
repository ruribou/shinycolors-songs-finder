"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  SongWithRelations,
  Unit,
  VibeTag,
  SongType,
  Member,
  AttributeType,
} from "@/lib/types/database";
import { updateSong } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const songTypes: { value: SongType; label: string }[] = [
  { value: "unit", label: "ユニット" },
  { value: "solo", label: "ソロ" },
  { value: "collaboration", label: "コラボ" },
  { value: "other", label: "その他" },
];

const attributeOptions: { value: AttributeType; label: string }[] = [
  { value: "stella", label: "Stella" },
  { value: "luna", label: "Luna" },
  { value: "sol", label: "Sol" },
];

export default function EditSongPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [song, setSong] = useState<SongWithRelations | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vibeTags, setVibeTags] = useState<VibeTag[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    unit_ids: [] as string[],
    member_id: "",
    song_type: "unit" as SongType,
    attribute: "" as AttributeType | "",
    youtube_url: "",
    vibe_tag_ids: [] as string[],
  });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/songs/${id}`);
      if (!res.ok) {
        setMessage({ type: "error", text: "楽曲が見つかりません" });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSong(data.song);
      setUnits(data.units);
      setVibeTags(data.vibeTags);
      setMembers(data.members);
      setFormData({
        title: data.song.title,
        unit_ids: data.song.units?.map((u: Unit) => u.id) || [],
        member_id: data.song.member_id || "",
        song_type: data.song.song_type,
        attribute: data.song.attribute || "",
        youtube_url: data.song.youtube_url || "",
        vibe_tag_ids: data.song.vibe_tags.map((t: VibeTag) => t.id),
      });
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const input = {
      title: formData.title,
      unit_ids: formData.unit_ids,
      member_id: formData.member_id || null,
      song_type: formData.song_type,
      attribute: formData.attribute || null,
      youtube_url: formData.youtube_url || null,
      vibe_tag_ids: formData.vibe_tag_ids,
    };

    const result = await updateSong(id, input);

    if (result.success) {
      setMessage({ type: "success", text: "楽曲を更新しました" });
      setTimeout(() => router.push("/admin/songs", { scroll: false }), 1000);
    } else {
      setMessage({ type: "error", text: result.error || "エラーが発生しました" });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">読み込み中...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/admin/songs"
            scroll={false}
            className="text-shiny-blue-dark hover:text-shiny-blue text-sm"
          >
            楽曲一覧に戻る
          </Link>
          <div className="mt-8 text-center text-slate-500">
            楽曲が見つかりません
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href="/admin/songs"
            scroll={false}
            className="text-shiny-blue-dark hover:text-shiny-blue text-sm"
          >
            楽曲一覧に戻る
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            楽曲を編集
          </h1>
        </header>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_url: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ユニット（複数選択可）
              </label>
              <div className="flex flex-wrap gap-2">
                {units.map((unit) => {
                  const isSelected = formData.unit_ids.includes(unit.id);
                  return (
                    <label
                      key={unit.id}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-shiny-blue text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              unit_ids: [...formData.unit_ids, unit.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              unit_ids: formData.unit_ids.filter(
                                (id) => id !== unit.id
                              ),
                            });
                          }
                        }}
                      />
                      {unit.name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  曲タイプ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.song_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      song_type: e.target.value as SongType,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
                >
                  {songTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.song_type === "solo" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  メンバー <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.member_id}
                  onChange={(e) =>
                    setFormData({ ...formData, member_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
                >
                  <option value="">選択してください</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(formData.song_type === "collaboration" ||
              formData.song_type === "other") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  属性（属性チーム曲の場合）
                </label>
                <select
                  value={formData.attribute}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attribute: e.target.value as AttributeType | "",
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
                >
                  <option value="">なし</option>
                  {attributeOptions.map((attr) => (
                    <option key={attr.value} value={attr.value}>
                      {attr.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Team.Stella等の曲の場合に選択
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                タグ（3つまで）
              </label>
              <div className="flex flex-wrap gap-2">
                {vibeTags.map((tag) => {
                  const isSelected = formData.vibe_tag_ids.includes(tag.id);
                  const isDisabled = !isSelected && formData.vibe_tag_ids.length >= 3;
                  return (
                    <label
                      key={tag.id}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? "bg-shiny-blue text-white cursor-pointer"
                          : isDisabled
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              vibe_tag_ids: [...formData.vibe_tag_ids, tag.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              vibe_tag_ids: formData.vibe_tag_ids.filter(
                                (id) => id !== tag.id
                              ),
                            });
                          }
                        }}
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-shiny-blue text-white rounded-lg hover:bg-shiny-blue-dark transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isSubmitting ? "保存中..." : "更新する"}
              </button>
              <Link
                href="/admin/songs"
                scroll={false}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
