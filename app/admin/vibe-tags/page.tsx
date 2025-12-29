import Link from "next/link";
import { getVibeTags } from "@/lib/queries";
import { VibeTagList } from "./VibeTagList";

export const dynamic = "force-dynamic";

export default async function AdminVibeTagsPage() {
  const vibeTags = await getVibeTags();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href="/admin"
            scroll={false}
            className="text-shiny-blue-dark hover:text-shiny-blue text-sm"
          >
            管理画面に戻る
          </Link>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-800">タグ管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              {vibeTags.length}件のタグ
            </p>
          </div>
        </header>

        <VibeTagList initialTags={vibeTags} />
      </div>
    </div>
  );
}
