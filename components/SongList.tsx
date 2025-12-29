"use client";

import Image from "next/image";
import type { SongWithRelations, AttributeType } from "@/lib/types/database";
import { extractVideoId, getThumbnailUrl } from "@/lib/youtube";

interface SongListProps {
  songs: SongWithRelations[];
}

const attributeStyles = {
  stella: {
    bg: "bg-gradient-to-r from-pink-100 to-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
    teamName: "Team.Stella",
  },
  luna: {
    bg: "bg-gradient-to-r from-blue-100 to-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    teamName: "Team.Luna",
  },
  sol: {
    bg: "bg-gradient-to-r from-amber-100 to-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    teamName: "Team.Sol",
  },
};

export function SongList({ songs }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-8 glass-card rounded-2xl">
          <p className="text-slate-500">該当する楽曲がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-shiny-blue/30 to-transparent" />
        <span className="text-sm font-medium text-slate-600 px-3">
          {songs.length}件の楽曲
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-shiny-blue/30 to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {songs.map((song, index) => {
          const videoId = song.youtube_url
            ? extractVideoId(song.youtube_url)
            : null;
          const thumbnailUrl = videoId ? getThumbnailUrl(videoId, "mq") : null;
          const songAttr = song.attribute as AttributeType | undefined;
          const memberAttr = song.member?.attribute as AttributeType | undefined;
          const displayAttr = songAttr ?? memberAttr;
          const attrStyle = displayAttr ? attributeStyles[displayAttr] : null;

          return (
            <a
              key={song.id}
              href={song.youtube_url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-fade-in block glass-card rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {thumbnailUrl && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={thumbnailUrl}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-shiny-blue-dark ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-slate-800 truncate text-lg">
                  {song.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">
                    {songAttr ? attrStyle?.teamName : song.unit?.name}
                  </span>
                  {song.member && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span>{song.member.name}</span>
                    </>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {attrStyle && displayAttr && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${attrStyle.bg} ${attrStyle.text} border ${attrStyle.border}`}
                    >
                      {displayAttr.charAt(0).toUpperCase() + displayAttr.slice(1)}
                    </span>
                  )}
                  {song.vibe_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-shiny-blue/10 text-shiny-blue-dark rounded-full text-xs font-medium"
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
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
