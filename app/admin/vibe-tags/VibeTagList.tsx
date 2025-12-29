"use client";

import { useState } from "react";
import type { VibeTag } from "@/lib/types/database";
import { createVibeTag, updateVibeTag, deleteVibeTag } from "./actions";

interface VibeTagListProps {
  initialTags: VibeTag[];
}

export function VibeTagList({ initialTags }: VibeTagListProps) {
  const [tags, setTags] = useState(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    const result = await createVibeTag(newTagName.trim());

    if (result.success) {
      setMessage({ type: "success", text: "タグを追加しました" });
      setNewTagName("");
      setNewTagSlug("");
      window.location.reload();
    } else {
      setMessage({ type: "error", text: result.error || "エラーが発生しました" });
    }

    setIsSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim() || !editingSlug.trim()) return;

    setIsSubmitting(true);
    const result = await updateVibeTag(id, editingName.trim(), editingSlug.trim());

    if (result.success) {
      setTags(
        tags.map((t) =>
          t.id === id ? { ...t, name: editingName.trim(), slug: editingSlug.trim() } : t
        )
      );
      setEditingId(null);
      setMessage({ type: "success", text: "タグを更新しました" });
    } else {
      setMessage({ type: "error", text: result.error || "更新に失敗しました" });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？\n紐付けられた楽曲からも削除されます。`)) {
      return;
    }

    const result = await deleteVibeTag(id);

    if (result.success) {
      setTags(tags.filter((t) => t.id !== id));
      setMessage({ type: "success", text: "タグを削除しました" });
    } else {
      setMessage({ type: "error", text: result.error || "削除に失敗しました" });
    }
  };

  const startEdit = (tag: VibeTag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingSlug(tag.slug);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingSlug("");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="新しいタグ名"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shiny-blue"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newTagName.trim()}
          className="px-4 py-2 bg-shiny-blue text-white rounded-lg hover:bg-shiny-blue-dark transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isSubmitting ? "追加中..." : "追加"}
        </button>
      </form>

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

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between px-4 py-3"
          >
            {editingId === tag.id ? (
              <div className="flex-1 flex gap-2 items-center">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="タグ名"
                  className="flex-1 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-shiny-blue"
                />
                <input
                  type="text"
                  value={editingSlug}
                  onChange={(e) => setEditingSlug(e.target.value)}
                  placeholder="slug"
                  className="w-40 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-shiny-blue text-sm"
                />
                <button
                  onClick={() => handleUpdate(tag.id)}
                  disabled={isSubmitting || !editingName.trim() || !editingSlug.trim()}
                  className="px-3 py-1 text-sm bg-shiny-blue text-white rounded hover:bg-shiny-blue-dark disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-slate-800">{tag.name}</span>
                  <span className="ml-2 text-xs text-slate-400">({tag.slug})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(tag)}
                    className="px-3 py-1 text-sm text-shiny-blue hover:text-shiny-blue-dark"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {tags.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            タグがありません
          </div>
        )}
      </div>
    </div>
  );
}
