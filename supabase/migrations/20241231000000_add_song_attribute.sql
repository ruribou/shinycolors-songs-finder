-- songsテーブルにattributeカラムを追加
-- 属性チーム曲（Team.Stella等）の場合にこのカラムを使用
ALTER TABLE songs ADD COLUMN attribute attribute_type;
