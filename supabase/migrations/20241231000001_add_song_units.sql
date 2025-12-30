-- song_units: 楽曲とユニットの多対多関係（複数ユニットコラボ対応）
create table song_units (
  song_id uuid not null references songs(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, unit_id)
);

-- インデックス
create index song_units_unit_id_idx on song_units(unit_id);

-- RLS有効化
alter table song_units enable row level security;

-- RLSポリシー（song_vibe_tagsと同様のパターン）
create policy "Anyone can view song_units for published songs" on song_units for select using (
  exists (select 1 from songs where songs.id = song_id and (songs.is_published = true or is_admin()))
);
create policy "Admin can insert song_units" on song_units for insert with check (is_admin());
create policy "Admin can delete song_units" on song_units for delete using (is_admin());

-- 既存データ移行: songs.unit_id から song_units へ
insert into song_units (song_id, unit_id)
select id, unit_id from songs where unit_id is not null;

-- songs.unit_id カラムを削除
alter table songs drop column unit_id;
