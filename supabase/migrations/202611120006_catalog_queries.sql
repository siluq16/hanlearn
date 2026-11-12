-- Read-only Sprint 1 query RPCs. SECURITY INVOKER preserves all existing RLS.
-- No content/answers/private rows are exposed and no domain transitions change.
create function public.get_due_review_count() returns bigint
language sql stable security invoker set search_path='' as $$
 select count(*) from public.review_cards c
 join public.vocabulary v on v.id=c.vocabulary_id
 where c.user_id=auth.uid() and c.archived_at is null and c.state<>'suspended'
 and c.due_at<=now() and v.status='published'
 and (c.card_type<>'audio_to_hanzi' or exists(
   select 1 from public.audio_assets a where a.id=v.audio_asset_id and a.status='published'))
$$;
revoke all on function public.get_due_review_count() from public,anon,authenticated;
grant execute on function public.get_due_review_count() to authenticated;

create function public.search_vocabulary(p_syllabus_id uuid,p_query text default '',
 p_level integer default null,p_offset integer default 0,p_limit integer default 20)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_query is null or length(p_query)>100 or p_offset is null or p_offset<0 or p_offset>100000
 or p_limit is null or p_limit not between 1 and 50
 or (p_level is not null and p_level not between 1 and 9) then
  raise exception 'invalid_search' using errcode='22023';
 end if;
 -- Literal substring matching: user text is a SQL parameter, never filter syntax.
 with filtered as (
  select v.id,v.simplified,v.pinyin_marked,v.meaning_vi,sv.introduced_level,s.code syllabus_code
  from public.vocabulary v join public.syllabus_vocabulary sv on sv.vocabulary_id=v.id
  join public.syllabus_versions s on s.id=sv.syllabus_id
  where sv.syllabus_id=p_syllabus_id and (p_level is null or sv.introduced_level=p_level)
   and strpos(lower(concat_ws(' ',v.simplified,v.traditional,v.pinyin_marked,v.pinyin_numeric,v.meaning_vi)),lower(btrim(p_query)))>0
 ), page as (select * from filtered order by simplified,pinyin_marked,id offset p_offset limit p_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p)) from page p),'[]'::jsonb),
  'total',(select count(*) from filtered)) into result;
 return result;
end $$;
revoke all on function public.search_vocabulary(uuid,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.search_vocabulary(uuid,text,integer,integer,integer) to authenticated;
