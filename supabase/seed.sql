-- マスタデータ（楽曲なし）

-- ユニット
insert into units (name, slug) values
  ('illumination STARS', 'illumination-stars'),
  ('L''Antica', 'lantica'),
  ('放課後クライマックスガールズ', 'houkago-climax-girls'),
  ('ALSTROEMERIA', 'alstroemeria'),
  ('Straylight', 'straylight'),
  ('noctchill', 'noctchill'),
  ('SHHis', 'shhis'),
  ('CoMETIK', 'cometik'),
  ('シャイニーカラーズ', 'shinycolors');

-- メンバー
insert into members (name, sort_order, attribute) values
  ('櫻木真乃', 1, 'stella'),
  ('風野灯織', 2, 'luna'),
  ('八宮めぐる', 3, 'sol'),
  ('月岡恋鐘', 4, 'stella'),
  ('田中摩美々', 5, 'luna'),
  ('白瀬咲耶', 6, 'sol'),
  ('三峰結華', 7, 'luna'),
  ('幽谷霧子', 8, 'luna'),
  ('小宮果穂', 9, 'stella'),
  ('園田智代子', 10, 'stella'),
  ('西城樹里', 11, 'sol'),
  ('杜野凛世', 12, 'luna'),
  ('有栖川夏葉', 13, 'sol'),
  ('大崎甘奈', 14, 'stella'),
  ('大崎甜花', 15, 'luna'),
  ('桑山千雪', 16, 'sol'),
  ('芹沢あさひ', 17, 'stella'),
  ('黛冬優子', 18, 'sol'),
  ('和泉愛依', 19, 'luna'),
  ('浅倉透', 20, 'sol'),
  ('樋口円香', 21, 'stella'),
  ('福丸小糸', 22, 'luna'),
  ('市川雛菜', 23, 'sol'),
  ('七草にちか', 24, 'sol'),
  ('緋田美琴', 25, 'stella'),
  ('斑鳩ルカ', 26, 'luna'),
  ('鈴木羽那', 27, 'stella'),
  ('郁田はるき', 28, 'sol');

-- メンバーとユニットの関連付け
-- illumination STARS
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('櫻木真乃', '風野灯織', '八宮めぐる') and u.slug = 'illumination-stars';

-- L'Antica
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('月岡恋鐘', '田中摩美々', '白瀬咲耶', '三峰結華', '幽谷霧子') and u.slug = 'lantica';

-- 放課後クライマックスガールズ
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('小宮果穂', '園田智代子', '西城樹里', '杜野凛世', '有栖川夏葉') and u.slug = 'houkago-climax-girls';

-- ALSTROEMERIA
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('大崎甘奈', '大崎甜花', '桑山千雪') and u.slug = 'alstroemeria';

-- Straylight
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('芹沢あさひ', '黛冬優子', '和泉愛依') and u.slug = 'straylight';

-- noctchill
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('浅倉透', '樋口円香', '福丸小糸', '市川雛菜') and u.slug = 'noctchill';

-- SHHis
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('七草にちか', '緋田美琴') and u.slug = 'shhis';

-- CoMETIK
insert into member_units (member_id, unit_id, is_primary)
select m.id, u.id, true from members m, units u
where m.name in ('斑鳩ルカ', '鈴木羽那', '郁田はるき') and u.slug = 'cometik';

-- Vibeタグ
-- テンポ・ノリ（1-4）
insert into vibe_tags (name, slug, sort_order) values
  ('アップテンポ', 'uptempo', 1),
  ('ミドルテンポ', 'midtempo', 2),
  ('バラード', 'ballad', 3),
  ('スロー', 'slow', 4);

-- 感情・情緒（5-8）
insert into vibe_tags (name, slug, sort_order) values
  ('前向き', 'hopeful', 5),
  ('切なさ', 'bittersweet', 6),
  ('内省', 'introspective', 7),
  ('多幸感', 'joyful', 8);

-- 世界観・テーマ（9-12）
insert into vibe_tags (name, slug, sort_order) values
  ('未来', 'future', 9),
  ('日常', 'daily', 10),
  ('夜', 'night', 11),
  ('成長', 'growth', 12);
