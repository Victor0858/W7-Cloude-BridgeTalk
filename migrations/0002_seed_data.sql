-- BridgeTalk MVP Seed Data
-- Migration: 0002_seed_data
-- Development-safe: all inserts use INSERT OR IGNORE
-- 5 US users (learning Japanese) + 5 JP users (learning English)
-- 4 topic packs seeded

-- =========================================================
-- Topic Packs
-- =========================================================
INSERT OR IGNORE INTO "w7-topic-packs" (id, name, name_jp, category, difficulty, prompts, is_free) VALUES
(
  'tp_daily_001',
  'Daily Life Conversations',
  '日常生活の会話',
  'daily_life',
  'beginner',
  '[
    "Describe your morning routine step by step.",
    "What did you have for lunch today? Describe it in detail.",
    "Talk about your neighborhood — what do you like or dislike about it?",
    "How do you usually spend your weekends?",
    "Describe your home or apartment.",
    "What is your favorite local restaurant and why?",
    "How do you get to school or work every day?",
    "Talk about a recent trip to the grocery store or market."
  ]',
  1
),
(
  'tp_anime_001',
  'Anime & Japanese Culture',
  'アニメと日本文化',
  'anime_culture',
  'beginner',
  '[
    "What is your favorite anime and why do you love it?",
    "Describe a Japanese festival you have attended or want to attend.",
    "What manga are you currently reading?",
    "Compare a Japanese food you tried with something from your home country.",
    "What aspects of Japanese culture surprise foreigners the most?",
    "If you could visit one place in Japan, where would it be and why?",
    "Talk about a Japanese movie or drama you recently watched.",
    "What Japanese word or phrase do you find most interesting?"
  ]',
  1
),
(
  'tp_career_001',
  'Career & Professional Life',
  'キャリアと仕事',
  'career',
  'intermediate',
  '[
    "Describe your current job or studies in detail.",
    "What are your career goals for the next three years?",
    "How do work cultures differ between the US and Japan?",
    "Practice introducing yourself in a professional setting.",
    "Describe a challenging project you worked on recently.",
    "How do you handle disagreements with coworkers or classmates?",
    "What skills are most important in your field?",
    "Talk about remote work: pros, cons, and your experience."
  ]',
  0
),
(
  'tp_travel_001',
  'Travel & Study Abroad',
  '旅行と留学',
  'travel',
  'beginner',
  '[
    "Describe the best trip you have ever taken.",
    "What would you do on a one-week trip to Tokyo?",
    "Talk about a cultural misunderstanding you experienced while traveling.",
    "What items are essential to pack when visiting Japan?",
    "Compare public transportation in the US vs Japan.",
    "What would you miss most about home if you studied abroad?",
    "Describe a time you got lost in an unfamiliar city.",
    "What language challenges do you face when traveling?"
  ]',
  0
);

-- =========================================================
-- US Users (learning Japanese, offering English)
-- =========================================================
INSERT OR IGNORE INTO "w7-users" (id, email, username, display_name, country_code) VALUES
  ('usr_alex_001',  'alex.chen@example.com',    'alexchen',    'Alex Chen',    'US'),
  ('usr_emma_002',  'emma.rodriguez@example.com','emmar',       'Emma Rodriguez','US'),
  ('usr_jake_003',  'jake.thompson@example.com', 'jakethompson','Jake Thompson', 'US'),
  ('usr_lily_004',  'lily.park@example.com',     'lilypark',    'Lily Park',    'US'),
  ('usr_noah_005',  'noah.williams@example.com', 'noahwilliams','Noah Williams', 'US');

-- US Profiles
INSERT OR IGNORE INTO "w7-profiles"
  (id, user_id, native_language, learning_language, proficiency_level,
   short_intro, interests, availability, preferred_exchange_format,
   reliability_score, reply_rate, total_sessions, onboarding_completed) VALUES
(
  'prf_alex_001', 'usr_alex_001', 'en', 'ja', 'B1',
  'Software engineer in Seattle. I have been studying Japanese for 2 years — huge Attack on Titan fan. Looking for a consistent partner to practice natural daily conversation.',
  '["anime","technology","hiking","cooking","travel"]',
  '[{"day":"Tuesday","time":"evening"},{"day":"Saturday","time":"morning"}]',
  'video', 4.8, 0.92, 12, 1
),
(
  'prf_emma_002', 'usr_emma_002', 'en', 'ja', 'A2',
  'Graduate student studying linguistics at UCLA. I am obsessed with Japanese food culture and plan to visit Osaka next year. Patient and enthusiastic conversation partner!',
  '["food","linguistics","travel","music","J-pop"]',
  '[{"day":"Monday","time":"evening"},{"day":"Wednesday","time":"evening"},{"day":"Sunday","time":"afternoon"}]',
  'video', 4.9, 0.97, 6, 1
),
(
  'prf_jake_003', 'usr_jake_003', 'en', 'ja', 'A2',
  'Marketing professional in New York. Started studying Japanese after falling in love with Studio Ghibli films. Looking for someone patient who enjoys casual conversation.',
  '["anime","movies","sports","business","music"]',
  '[{"day":"Thursday","time":"evening"},{"day":"Saturday","time":"afternoon"}]',
  'audio', 4.5, 0.85, 3, 1
),
(
  'prf_lily_004', 'usr_lily_004', 'en', 'ja', 'B1',
  'Art teacher in Chicago. I paint and study Japanese calligraphy as a hobby. Would love to talk about Japanese art, culture, and everyday life with a native speaker.',
  '["art","calligraphy","travel","food","culture"]',
  '[{"day":"Tuesday","time":"morning"},{"day":"Friday","time":"evening"}]',
  'video', 5.0, 1.0, 18, 1
),
(
  'prf_noah_005', 'usr_noah_005', 'en', 'ja', 'A2',
  'College student in Boston studying international relations. I want to use Japanese in my future career. Big fan of Japanese baseball (Go Tigers!) and ramen.',
  '["sports","politics","travel","food","gaming"]',
  '[{"day":"Wednesday","time":"afternoon"},{"day":"Sunday","time":"morning"}]',
  'video', 4.7, 0.90, 2, 1
);

-- =========================================================
-- Japanese Users (learning English, offering Japanese)
-- =========================================================
INSERT OR IGNORE INTO "w7-users" (id, email, username, display_name, country_code) VALUES
  ('usr_yuki_006',  'yuki.tanaka@example.com',   'yukitanaka',  '田中 雪 (Yuki)',    'JP'),
  ('usr_haruto_007','haruto.sato@example.com',   'harutosato',  '佐藤 悠人 (Haruto)','JP'),
  ('usr_airi_008',  'airi.yamamoto@example.com', 'airiyamamoto','山本 愛里 (Airi)',  'JP'),
  ('usr_kenji_009', 'kenji.nakamura@example.com','kenjinakamura','中村 健二 (Kenji)', 'JP'),
  ('usr_sakura_010','sakura.ito@example.com',    'sakuraito',   '伊藤 さくら (Sakura)','JP');

-- Japanese Profiles
INSERT OR IGNORE INTO "w7-profiles"
  (id, user_id, native_language, learning_language, proficiency_level,
   short_intro, interests, availability, preferred_exchange_format,
   reliability_score, reply_rate, total_sessions, onboarding_completed) VALUES
(
  'prf_yuki_006', 'usr_yuki_006', 'ja', 'en', 'B1',
  'University student in Tokyo studying environmental science. I want to practice natural English conversation for future research presentations. Love hiking and photography.',
  '["nature","science","photography","travel","music"]',
  '[{"day":"Monday","time":"evening"},{"day":"Saturday","time":"morning"}]',
  'video', 4.9, 0.95, 9, 1
),
(
  'prf_haruto_007', 'usr_haruto_007', 'ja', 'en', 'A2',
  'Junior software engineer at a startup in Osaka. I use English at work for reading docs but want to improve my speaking confidence. Big fan of NBA basketball and RPG games.',
  '["technology","gaming","sports","anime","music"]',
  '[{"day":"Tuesday","time":"evening"},{"day":"Sunday","time":"afternoon"}]',
  'audio', 4.6, 0.88, 4, 1
),
(
  'prf_airi_008', 'usr_airi_008', 'ja', 'en', 'B1',
  'English teacher at a junior high school in Kyoto. I know a lot of English grammar but struggle with natural conversation flow. I love reading, cooking, and Kyoto''s temple culture.',
  '["education","cooking","history","travel","books"]',
  '[{"day":"Wednesday","time":"evening"},{"day":"Saturday","time":"afternoon"},{"day":"Sunday","time":"morning"}]',
  'video', 5.0, 1.0, 21, 1
),
(
  'prf_kenji_009', 'usr_kenji_009', 'ja', 'en', 'A2',
  'Marketing coordinator in Tokyo who dreams of working abroad. I want to practice business English and casual conversation. Loves coffee, cycling, and American TV shows.',
  '["business","cycling","TV shows","coffee","design"]',
  '[{"day":"Thursday","time":"evening"},{"day":"Saturday","time":"morning"}]',
  'video', 4.7, 0.91, 7, 1
),
(
  'prf_sakura_010', 'usr_sakura_010', 'ja', 'en', 'B1',
  'Nurse in Sapporo planning to get an international nursing certification. I need practical English for medical contexts but also want natural conversation partners. Fan of K-pop and yoga.',
  '["health","yoga","music","cooking","animals"]',
  '[{"day":"Monday","time":"morning"},{"day":"Friday","time":"evening"}]',
  'video', 4.8, 0.94, 14, 1
);

-- =========================================================
-- Sample sessions between matched pairs
-- =========================================================
INSERT OR IGNORE INTO "w7-sessions"
  (id, user_id_a, user_id_b, scheduled_at, duration_minutes, status, topic_id, session_number) VALUES
  ('ses_001', 'usr_alex_001', 'usr_yuki_006',  '2026-04-20 09:00:00', 30, 'scheduled',  'tp_daily_001', 3),
  ('ses_002', 'usr_emma_002', 'usr_airi_008',  '2026-04-21 19:00:00', 30, 'scheduled',  'tp_anime_001', 2),
  ('ses_003', 'usr_lily_004', 'usr_sakura_010','2026-04-19 10:00:00', 30, 'completed',  'tp_daily_001', 5),
  ('ses_004', 'usr_jake_003', 'usr_haruto_007','2026-04-22 20:00:00', 30, 'scheduled',  'tp_anime_001', 1),
  ('ses_005', 'usr_noah_005', 'usr_kenji_009', '2026-04-18 14:00:00', 30, 'completed',  'tp_career_001', 2);

-- =========================================================
-- Sample feedback for completed sessions
-- =========================================================
INSERT OR IGNORE INTO "w7-feedback"
  (id, session_id, from_user_id, to_user_id,
   was_helpful, want_again, was_punctual, was_polite, was_engaged,
   improvement_notes, second_session_interest) VALUES
('fb_001', 'ses_003', 'usr_lily_004',  'usr_sakura_010', 5, 1, 1, 1, 1, 'Would love to try the career track next time!', 1),
('fb_002', 'ses_003', 'usr_sakura_010','usr_lily_004',   5, 1, 1, 1, 1, 'Her Japanese corrections were so helpful. Already scheduled session 6.', 1),
('fb_003', 'ses_005', 'usr_noah_005',  'usr_kenji_009',  4, 1, 1, 1, 1, 'We went a bit off-topic. More structure would help.', 1),
('fb_004', 'ses_005', 'usr_kenji_009', 'usr_noah_005',   4, 1, 0, 1, 1, 'Was 3 minutes late but session was great overall.', 1);

-- =========================================================
-- Sample saved matches
-- =========================================================
INSERT OR IGNORE INTO "w7-saved-matches" (id, user_id, saved_user_id) VALUES
  ('sm_001', 'usr_alex_001', 'usr_airi_008'),
  ('sm_002', 'usr_emma_002', 'usr_yuki_006'),
  ('sm_003', 'usr_lily_004', 'usr_haruto_007');
