-- シャニマス楽曲検索 初期スキーマ
-- 全マイグレーション統合版

-- 拡張機能
create extension if not exists pg_trgm;

-- units: ユニットマスタ
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- members: アイドルマスタ
create type attribute_type as enum ('stella', 'luna', 'sol');

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  attribute attribute_type not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- member_units: メンバーとユニットの多対多関係
create table member_units (
  member_id uuid not null references members(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (member_id, unit_id)
);

-- songs: 楽曲テーブル
create type song_type as enum ('unit', 'solo', 'collaboration', 'other');

create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  unit_id uuid references units(id) on delete restrict,
  member_id uuid references members(id) on delete restrict,
  song_type song_type not null default 'unit',
  youtube_url text,
  links jsonb default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- vibe_tags: Vibeタグマスタ
create table vibe_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- song_vibe_tags: 楽曲とVibeタグの中間テーブル
create table song_vibe_tags (
  song_id uuid not null references songs(id) on delete cascade,
  vibe_tag_id uuid not null references vibe_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, vibe_tag_id)
);

-- inquiries: お問い合わせ
create type inquiry_type as enum ('request', 'question', 'other');
create type inquiry_status as enum ('pending', 'in_progress', 'completed', 'issued');

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type inquiry_type not null,
  name text,
  content text not null,
  status inquiry_status not null default 'pending',
  github_issue_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- admin_emails: 管理者メール許可リスト
create table admin_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- rate_limit_attempts: レート制限用
create table rate_limit_attempts (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  attempted_at timestamptz not null default now()
);

-- updated_at自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger songs_updated_at before update on songs
  for each row execute function update_updated_at();

create trigger inquiries_updated_at before update on inquiries
  for each row execute function update_updated_at();

-- Admin判定関数
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from admin_emails
    where email = auth.jwt()->>'email'
  );
end;
$$ language plpgsql security definer;

-- インデックス
create index songs_unit_id_idx on songs(unit_id);
create index songs_member_id_idx on songs(member_id) where member_id is not null;
create index songs_song_type_idx on songs(song_type);
create index songs_title_idx on songs using gin(title gin_trgm_ops);
create index songs_is_published_idx on songs(is_published) where is_published = true;
create index vibe_tags_sort_order_idx on vibe_tags(sort_order);
create index song_vibe_tags_vibe_tag_id_idx on song_vibe_tags(vibe_tag_id);
create index rate_limit_attempts_key_time_idx on rate_limit_attempts(key, attempted_at);

-- RLS有効化
alter table units enable row level security;
alter table members enable row level security;
alter table member_units enable row level security;
alter table songs enable row level security;
alter table vibe_tags enable row level security;
alter table song_vibe_tags enable row level security;
alter table inquiries enable row level security;
alter table admin_emails enable row level security;
alter table rate_limit_attempts enable row level security;

-- RLSポリシー: units
create policy "Anyone can view units" on units for select using (true);
create policy "Admin can insert units" on units for insert with check (is_admin());
create policy "Admin can update units" on units for update using (is_admin());
create policy "Admin can delete units" on units for delete using (is_admin());

-- RLSポリシー: members
create policy "Anyone can view members" on members for select using (true);
create policy "Admin can insert members" on members for insert with check (is_admin());
create policy "Admin can update members" on members for update using (is_admin());
create policy "Admin can delete members" on members for delete using (is_admin());

-- RLSポリシー: member_units
create policy "Anyone can view member_units" on member_units for select using (true);
create policy "Admin can insert member_units" on member_units for insert with check (is_admin());
create policy "Admin can update member_units" on member_units for update using (is_admin());
create policy "Admin can delete member_units" on member_units for delete using (is_admin());

-- RLSポリシー: songs
create policy "Anyone can view published songs" on songs for select using (is_published = true or is_admin());
create policy "Admin can insert songs" on songs for insert with check (is_admin());
create policy "Admin can update songs" on songs for update using (is_admin());
create policy "Admin can delete songs" on songs for delete using (is_admin());

-- RLSポリシー: vibe_tags
create policy "Anyone can view vibe_tags" on vibe_tags for select using (true);
create policy "Admin can insert vibe_tags" on vibe_tags for insert with check (is_admin());
create policy "Admin can update vibe_tags" on vibe_tags for update using (is_admin());
create policy "Admin can delete vibe_tags" on vibe_tags for delete using (is_admin());

-- RLSポリシー: song_vibe_tags
create policy "Anyone can view song_vibe_tags for published songs" on song_vibe_tags for select using (
  exists (select 1 from songs where songs.id = song_id and (songs.is_published = true or is_admin()))
);
create policy "Admin can insert song_vibe_tags" on song_vibe_tags for insert with check (is_admin());
create policy "Admin can delete song_vibe_tags" on song_vibe_tags for delete using (is_admin());

-- RLSポリシー: inquiries
create policy "Anyone can insert inquiries" on inquiries for insert with check (true);
create policy "Admin can view inquiries" on inquiries for select using (is_admin());
create policy "Admin can update inquiries" on inquiries for update using (is_admin());
create policy "Admin can delete inquiries" on inquiries for delete using (is_admin());
