"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type {
  SongWithRelations,
  Unit,
  VibeTag,
  SongType,
  AttributeType,
} from "@/lib/types/database";
import { createSong, deleteSong, togglePublishSong } from "./actions";
import { canPublishSong } from "@/lib/types/database";

interface Member {
  id: string;
  name: string;
  attribute: string;
}

interface SongTableProps {
  songs: SongWithRelations[];
  units: Unit[];
  vibeTags: VibeTag[];
  members: Member[];
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

export function SongTable({ songs, units, vibeTags, members }: SongTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    unit_id: "",
    member_id: "",
    song_type: "unit" as SongType,
    attribute: "" as AttributeType | "",
    youtube_url: "",
    vibe_tag_ids: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      unit_id: "",
      member_id: "",
      song_type: "unit",
      attribute: "",
      youtube_url: "",
      vibe_tag_ids: [],
    });
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen]);

  const handleTogglePublish = async (song: SongWithRelations) => {
    const result = await togglePublishSong(song.id);
    if (result.success) {
      setMessage({
        type: "success",
        text: song.is_published ? "非公開にしました" : "公開しました",
      });
    } else {
      setMessage({ type: "error", text: result.error || "エラーが発生しました" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const input = {
      title: formData.title,
      unit_id: formData.unit_id || null,
      member_id: formData.member_id || null,
      song_type: formData.song_type,
      attribute: formData.attribute || null,
      youtube_url: formData.youtube_url || null,
      vibe_tag_ids: formData.vibe_tag_ids,
    };

    const result = await createSong(input);

    if (result.success) {
      setMessage({ type: "success", text: "楽曲を追加しました" });
      setIsFormOpen(false);
      resetForm();
    } else {
      setMessage({ type: "error", text: result.error || "エラーが発生しました" });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    const result = await deleteSong(id);
    if (result.success) {
      setMessage({ type: "success", text: "楽曲を削除しました" });
    } else {
      setMessage({ type: "error", text: result.error || "削除に失敗しました" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-shiny-blue text-white rounded-lg hover:bg-shiny-blue-dark transition-colors text-sm font-medium"
        >
          楽曲を追加
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50"
            style={{ touchAction: "none" }}
            onClick={() => {
              setIsFormOpen(false);
              resetForm();
            }}
          />
          <div
            className="relative w-full max-w-2xl mx-4 my-4 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-lg border border-slate-200 p-6"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", overscrollBehavior: "contain" }}
          >
            <h2 className="text-lg font-medium text-slate-800 mb-4">
              楽曲を追加
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ユニット
                  </label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_id: e.target.value,
                        member_id: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
                  >
                    <option value="">選択してください</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="px-4 py-2 bg-shiny-blue text-white rounded-lg hover:bg-shiny-blue-dark transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isSubmitting ? "保存中..." : "追加する"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                状態
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                タイトル
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                ユニット
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                曲のタイプ
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                タグ
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {songs.map((song) => {
              const publishable = canPublishSong(song);
              return (
                <tr key={song.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {song.is_published ? (
                      <span className="inline-block w-12 text-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        公開
                      </span>
                    ) : (
                      <span className="inline-block w-12 text-center px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                        下書き
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {song.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {song.unit?.name || <span className="text-slate-400">未設定</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {songTypes.find((t) => t.value === song.song_type)?.label}
                    {song.member && ` / ${song.member.name}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {song.vibe_tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {song.vibe_tags.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{song.vibe_tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleTogglePublish(song)}
                        disabled={!song.is_published && !publishable}
                        className={`px-2 py-1 text-xs rounded ${
                          song.is_published
                            ? "text-orange-600 hover:text-orange-700"
                            : publishable
                              ? "text-green-600 hover:text-green-700"
                              : "text-slate-400 cursor-not-allowed"
                        }`}
                        title={!song.is_published && !publishable ? "公開に必要な項目が未設定です" : ""}
                      >
                        {song.is_published ? "下書きに戻す" : "公開"}
                      </button>
                      <Link
                        href={`/admin/songs/${song.id}/edit`}
                        className="px-2 py-1 text-xs text-shiny-blue-dark hover:text-shiny-blue"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-700"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            楽曲がありません
          </div>
        )}
      </div>
    </div>
  );
}
