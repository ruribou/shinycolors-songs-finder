export type SongType = "unit" | "solo" | "collaboration" | "other";
export type AttributeType = "stella" | "luna" | "sol";

export interface Unit {
  id: string;
  name: string;
  slug: string;
}

export interface MemberUnit {
  member_id: string;
  unit_id: string;
  is_primary: boolean;
  unit?: Unit;
}

export interface Member {
  id: string;
  name: string;
  sort_order: number;
  attribute: AttributeType;
  member_units?: MemberUnit[];
  units?: Unit[];
}

export interface VibeTag {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface SongUnit {
  song_id: string;
  unit_id: string;
  unit?: Unit;
}

export interface Song {
  id: string;
  title: string;
  member_id: string | null;
  song_type: SongType;
  attribute: AttributeType | null;
  youtube_url: string | null;
  links: Record<string, string>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  member?: Member | null;
  vibe_tags?: VibeTag[];
  units?: Unit[];
}

export interface SongWithRelations extends Song {
  units: Unit[];
  member: Member | null;
  vibe_tags: VibeTag[];
}

export function canPublishSong(song: Song): boolean {
  if (!song.title || !song.youtube_url) {
    return false;
  }
  const hasUnitOrAttribute =
    (song.units && song.units.length > 0) || song.attribute;
  if (song.song_type !== "collaboration" && !hasUnitOrAttribute) {
    return false;
  }
  if (song.song_type === "solo" && !song.member_id) {
    return false;
  }
  return true;
}

export type InquiryType = "request" | "question" | "other";
export type InquiryStatus = "pending" | "in_progress" | "completed" | "issued";

export interface Inquiry {
  id: string;
  inquiry_type: InquiryType;
  name: string | null;
  content: string;
  status: InquiryStatus;
  github_issue_url: string | null;
  created_at: string;
  updated_at: string;
}
