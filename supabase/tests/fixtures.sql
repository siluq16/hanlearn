-- Synthetic fixtures only. Not authorized HSK content and never a production seed.
insert into auth.users(id,email,email_confirmed_at) values
 ('a0000000-0000-0000-0000-000000000001','a@example.invalid',now()),
 ('a0000000-0000-0000-0000-000000000002','b@example.invalid',now()),
 ('a0000000-0000-0000-0000-000000000003','outsider@example.invalid',now());
insert into private.allowed_learners(user_id) values
 ('a0000000-0000-0000-0000-000000000001'),('a0000000-0000-0000-0000-000000000002');
insert into public.syllabus_versions(id,code,display_name,verified_at,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 values('10000000-0000-0000-0000-000000000001','TEST-NOT-HSK','Synthetic test syllabus',now(),'published','approved','urn:hanlearn:test','self-authored','test',now());
insert into public.courses(id,syllabus_id,hsk_level,title,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 select ('20000000-0000-0000-0000-00000000000'||n)::uuid,'10000000-0000-0000-0000-000000000001',1,'Test course',case n when 1 then 'published' else 'draft' end,'approved','urn:hanlearn:test','self-authored','test',now() from generate_series(1,2) n;
insert into public.units(id,course_id,title,sort_order,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 select ('30000000-0000-0000-0000-00000000000'||n)::uuid,('20000000-0000-0000-0000-00000000000'||n)::uuid,'Test unit',1,'published','approved','urn:hanlearn:test','self-authored','test',now() from generate_series(1,2) n;
insert into public.lessons(id,unit_id,title,sort_order,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 select ('40000000-0000-0000-0000-00000000000'||n)::uuid,('30000000-0000-0000-0000-00000000000'||n)::uuid,'Test lesson',1,'published','approved','urn:hanlearn:test','self-authored','test',now() from generate_series(1,2) n;
insert into public.vocabulary(id,simplified,pinyin_marked,meaning_vi,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 values('50000000-0000-0000-0000-000000000001','TEST-FIXTURE','test','Test only','published','approved','urn:hanlearn:test','self-authored','test',now()),
 ('50000000-0000-0000-0000-000000000002','DRAFT-FIXTURE','test','Test only','draft','pending',null,null,null,null);
insert into public.lesson_vocabulary(lesson_id,vocabulary_id) values
 ('40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001'),
 ('40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002');
insert into public.syllabus_vocabulary(syllabus_id,vocabulary_id,introduced_level) values
 ('10000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001',1),
 ('10000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000002',1);
insert into public.lesson_quizzes(id,lesson_id,title) values
 ('60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','Synthetic quiz');
insert into public.quiz_questions(id,quiz_id,sort_order,prompt,choices,status,review_status,source_uri,content_license,reviewed_by,reviewed_at)
 select ('70000000-0000-0000-0000-00000000000'||n)::uuid,'60000000-0000-0000-0000-000000000001',n,'TEST QUESTION '||n,
 '["fixture A","fixture B"]','published','approved','urn:hanlearn:test','self-authored','test',now() from generate_series(1,5) n;
insert into private.quiz_answer_keys(question_id,correct_index)
 select id,0 from public.quiz_questions;
update public.lesson_quizzes set status='published',review_status='approved',source_uri='urn:hanlearn:test',
 content_license='self-authored',reviewed_by='test',reviewed_at=now() where id='60000000-0000-0000-0000-000000000001';
insert into public.review_cards(id,user_id,vocabulary_id,card_type,due_at) values
 ('80000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','hanzi_to_vi',now()-interval '1 day'),
 ('80000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','hanzi_to_vi',now()-interval '1 day');

