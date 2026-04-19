export type Lang = 'en' | 'ja';

export const translations = {
  en: {
    nav: {
      how_it_works: 'How It Works',
      matching: 'Find Partners',
      pricing: 'Pricing',
      join_waitlist: 'Join Waitlist',
      sign_in: 'Sign In',
      get_started: 'Get Started',
    },
    hero: {
      badge: 'Now accepting early members',
      headline: 'Find Your Language Partner.\nKeep Them.',
      subheadline:
        'BridgeTalk matches motivated Japanese and English learners for structured, recurring exchange sessions — because the real value isn\'t finding someone, it\'s coming back for session 2, 3, and beyond.',
      cta_primary: 'Join the Waitlist',
      cta_secondary: 'See How It Works',
      social_proof: 'Trusted by 240+ learners on the waitlist',
    },
    pain: {
      section_label: 'Sound familiar?',
      headline: 'Language exchange is broken.',
      subheadline:
        'You\'ve tried apps, forums, and social media. It never quite works. Here\'s why.',
      items: [
        {
          title: 'Partners vanish after one chat',
          desc: 'You matched, had a decent first session, then — silence. Finding someone new starts over.',
        },
        {
          title: 'Ghosting is exhausting',
          desc: 'You schedule a time, prepare topics, then they don\'t show up. No message, no reason.',
        },
        {
          title: 'Level mismatch kills conversation',
          desc: 'Too advanced and you\'re lost. Too basic and nothing real gets said. Finding the fit is luck.',
        },
        {
          title: 'No structure means no progress',
          desc: '"So… what do you want to talk about?" That awkward silence is where motivation goes to die.',
        },
        {
          title: 'It feels like a dating app',
          desc: 'Many exchange platforms attract the wrong crowd. It\'s uncomfortable and undermines real learning.',
        },
        {
          title: 'No improvement loop',
          desc: 'After the session ends, you forget what you learned. There\'s no note, no plan, no next step.',
        },
      ],
    },
    solution: {
      section_label: 'How BridgeTalk is different',
      headline: 'Structured. Safe. Sustainable.',
      subheadline:
        'We built BridgeTalk to fix every single one of those problems — not with more features, but with better design.',
      items: [
        {
          title: 'Smart matching for longevity',
          desc: 'We match by level, schedule, and goals — not just language. Every partner is chosen to last.',
        },
        {
          title: 'Accountability built in',
          desc: 'Session reminders, reliability scores, and a vouch system keep both sides showing up.',
        },
        {
          title: 'Topic cards for every session',
          desc: 'No more awkward silences. Choose a topic pack and get conversation prompts designed for your level.',
        },
        {
          title: 'Learning-first design',
          desc: 'Clean profiles, clear learning goals, zero dating-app energy. We enforce community standards.',
        },
        {
          title: 'Progress notes after every session',
          desc: 'Quick notes, corrections for your partner, and a "next time we talk about…" to keep momentum.',
        },
        {
          title: 'The second session is the goal',
          desc: 'Our design, our metrics, our follow-ups — everything is optimized for session #2, not session #1.',
        },
      ],
    },
    how: {
      section_label: 'How it works',
      headline: 'From sign-up to fluency in four steps.',
      steps: [
        {
          num: '01',
          title: 'Build your profile',
          desc: 'Tell us your level, schedule, interests, and what you\'re looking for. Takes 5 minutes.',
        },
        {
          num: '02',
          title: 'Get matched',
          desc: 'We surface 3–5 compatible partners based on level fit, availability, and shared interests.',
        },
        {
          num: '03',
          title: 'Book a 15-min trial',
          desc: 'No pressure — just a short trial session with a structured topic card to break the ice.',
        },
        {
          num: '04',
          title: 'Build a rhythm',
          desc: 'After a great trial, schedule your first full session. Track progress. Come back every week.',
        },
      ],
    },
    tracks: {
      section_label: 'Conversation tracks',
      headline: 'Always know what to talk about.',
      subheadline:
        'Every session comes with a topic pack designed for your level and interests.',
      items: [
        {
          name: 'Daily Life',
          name_jp: '日常生活',
          level: 'Beginner',
          desc: 'Morning routines, food, neighborhoods, weekend plans. Natural conversation starters.',
          free: true,
        },
        {
          name: 'Anime & Culture',
          name_jp: 'アニメ・文化',
          level: 'Beginner',
          desc: 'Favorite shows, manga, Japanese festivals, food comparisons. For the culturally curious.',
          free: true,
        },
        {
          name: 'Career & Business',
          name_jp: 'キャリア・仕事',
          level: 'Intermediate',
          desc: 'Professional introductions, work culture differences, career goals, and job interviews.',
          free: false,
        },
        {
          name: 'Travel & Study Abroad',
          name_jp: '旅行・留学',
          level: 'Beginner',
          desc: 'Trip planning, transport, cultural differences, and survival phrases for your next trip.',
          free: false,
        },
      ],
    },
    testimonials: {
      section_label: 'What members say',
      headline: 'Real exchanges. Real progress.',
      items: [
        {
          quote:
            'I\'ve tried three other apps and always got ghosted after the first session. With BridgeTalk, Yuki and I are on session 12. The topic cards changed everything.',
          name: 'Alex C.',
          role: 'Software Engineer, Seattle — learning Japanese',
          level: 'B1',
          sessions: 12,
        },
        {
          quote:
            '毎週同じパートナーと練習できて、英語の自信がすごく上がりました。構造があるから何を話せばいいか迷わない。',
          name: 'Airi Y.',
          role: 'English teacher, Kyoto — learning English',
          level: 'B1',
          sessions: 21,
        },
        {
          quote:
            'It doesn\'t feel like a language app or a dating app. It feels like a learning platform. That\'s exactly what I needed to take it seriously.',
          name: 'Emma R.',
          role: 'Graduate student, UCLA — learning Japanese',
          level: 'A2',
          sessions: 6,
        },
      ],
    },
    for_who: {
      section_label: 'Is BridgeTalk for you?',
      headline: 'Built for serious learners.\nNot for everyone.',
      for_items: [
        'You\'re learning Japanese (A2–B1) and want a consistent speaking partner',
        'You\'re a Japanese speaker wanting natural English conversation practice',
        'You\'re willing to commit to weekly sessions — not one-and-done chats',
        'You value structure: topics, notes, and progress over time',
        'You want a safe, learning-focused environment with zero dating vibes',
      ],
      not_for_items: [
        'Casual chat with no learning goals',
        'People looking for romantic connections',
        'Those who want unlimited daily pen pals',
        'Passive learners who skip prep',
      ],
    },
    faq: {
      section_label: 'FAQ',
      headline: 'Common questions.',
      items: [
        {
          q: 'Is BridgeTalk free?',
          a: 'Yes — the core matching and trial sessions are free. Plus and Premium plans unlock career tracks, session history, and mentor review.',
        },
        {
          q: 'What if my partner doesn\'t show up?',
          a: 'We track reliability scores. No-shows without 24-hour notice affect a partner\'s score and visibility in the system. Patterns lead to suspension.',
        },
        {
          q: 'How long is each session?',
          a: 'Trial sessions are 15 minutes. Regular sessions are 30 minutes each way (15 min in each language). You can extend up to 60 min.',
        },
        {
          q: 'Can I have multiple partners?',
          a: 'Free plan: 1 active partner. Plus: up to 3. Premium: unlimited. We find that one consistent partner drives more progress than many casual ones.',
        },
        {
          q: 'Is it video or text?',
          a: 'You choose — video, audio-only, or text. Most members prefer video for natural conversation flow.',
        },
        {
          q: 'What languages are supported right now?',
          a: 'For this MVP, we\'re focused exclusively on English ↔ Japanese exchange — the pairing with the strongest demand and cultural curiosity on both sides.',
        },
      ],
    },
    waitlist: {
      headline: 'Ready to find your language partner?',
      subheadline:
        'Join 240+ learners on the early access list. We\'re matching in small cohorts — apply now to hold your spot.',
      placeholder: 'Your email address',
      cta: 'Join the Waitlist',
      note: 'No spam. Unsubscribe anytime. We email max once a week.',
      success: 'You\'re on the list! We\'ll be in touch.',
    },
    footer: {
      tagline: 'Structured language exchange for serious learners.',
      links: ['How It Works', 'Pricing', 'FAQ', 'Privacy', 'Terms'],
      copy: '© 2026 BridgeTalk. All rights reserved.',
    },
  },

  ja: {
    nav: {
      how_it_works: '使い方',
      matching: 'パートナーを探す',
      pricing: '料金プラン',
      join_waitlist: 'ウェイトリスト登録',
      sign_in: 'ログイン',
      get_started: '始める',
    },
    hero: {
      badge: '早期メンバー募集中',
      headline: '続けられる英語交換\nパートナーを見つけよう',
      subheadline:
        'BridgeTalkは、英語と日本語を学ぶ学習者を、構造化された定期的なセッションでつなぎます。本当の価値は「出会い」ではなく、「2回目、3回目と続けること」にあります。',
      cta_primary: 'ウェイトリストに登録',
      cta_secondary: '使い方を見る',
      social_proof: '240名以上がウェイトリスト登録済み',
    },
    pain: {
      section_label: '心当たりはありますか？',
      headline: '語学交換は\nうまくいかない。',
      subheadline:
        'アプリ、SNS、掲示板でパートナーを探しても、なかなか続かない。その理由がここにあります。',
      items: [
        {
          title: '1回で終わってしまう',
          desc: 'せっかく会話したのに、次回の連絡なし。また一から探さないといけない。',
        },
        {
          title: 'ドタキャン・無視が多い',
          desc: '約束した時間に相手が来ない。メッセージもなし。また準備した時間が無駄になる。',
        },
        {
          title: 'レベルが合わない',
          desc: '相手が上手すぎると迷子に。下手すぎると会話が成立しない。ぴったりの人を見つけるのは運頼み。',
        },
        {
          title: '話題に困る',
          desc: '「何の話をすればいいですか？」その沈黙が、やる気を奪っていく。',
        },
        {
          title: '出会いアプリみたいな雰囲気',
          desc: '学習目的で登録したのに、変なメッセージが来る。安心して使えない。',
        },
        {
          title: '上達している実感がない',
          desc: 'セッションが終わると何を学んだか忘れてしまう。記録も、次回の計画もない。',
        },
      ],
    },
    solution: {
      section_label: 'BridgeTalkが違う理由',
      headline: '構造的。安全。\n続けられる。',
      subheadline:
        'BridgeTalkはこれらの問題をすべて解決するために作られました。機能を増やすのではなく、より良い設計で。',
      items: [
        {
          title: '長続きする相性でマッチング',
          desc: '言語だけでなく、レベル・スケジュール・目標で相手を選ぶ。長く続く組み合わせを最優先に。',
        },
        {
          title: '責任感を高める仕組み',
          desc: 'セッションリマインダー、信頼スコア、評価システムで、お互いが真剣に向き合う環境を作る。',
        },
        {
          title: '毎回のトピックカード',
          desc: '気まずい沈黙は不要。自分のレベルに合ったトピックパックとプロンプトが会話を導く。',
        },
        {
          title: '学習優先のデザイン',
          desc: 'クリーンなプロフィール、明確な学習目標、出会いアプリ感ゼロ。コミュニティガイドラインを徹底。',
        },
        {
          title: 'セッション後の進歩ノート',
          desc: 'メモ、相手への訂正、「次回はこれを話したい」— 学びを次につなげる仕組み。',
        },
        {
          title: '2回目のセッションが目標',
          desc: 'デザインも、指標も、フォローアップも、すべては「また会いたい」を生み出すために最適化。',
        },
      ],
    },
    how: {
      section_label: '使い方',
      headline: '登録から会話力アップまで、4ステップ。',
      steps: [
        {
          num: '01',
          title: 'プロフィール作成',
          desc: 'レベル、スケジュール、興味、希望を入力。5分で完了。',
        },
        {
          num: '02',
          title: 'マッチング',
          desc: 'レベル・空き時間・共通の興味をもとに、3〜5名の相性の良いパートナーを提案。',
        },
        {
          num: '03',
          title: '15分トライアル',
          desc: 'プレッシャーなし。構造化されたトピックカードで、気軽に最初の会話を。',
        },
        {
          num: '04',
          title: 'リズムを作る',
          desc: 'トライアルが成功したら、毎週のセッションをスケジュール。進捗を記録して続ける。',
        },
      ],
    },
    tracks: {
      section_label: '会話トラック',
      headline: '何を話せばいいか、\nいつでも分かる。',
      subheadline:
        '毎回のセッションに、レベルと興味に合わせたトピックパックをご用意。',
      items: [
        {
          name: 'Daily Life',
          name_jp: '日常生活',
          level: '初級',
          desc: '朝のルーティン、食事、近所、週末の予定。自然な会話のきっかけ。',
          free: true,
        },
        {
          name: 'Anime & Culture',
          name_jp: 'アニメ・文化',
          level: '初級',
          desc: 'お気に入りの作品、マンガ、日本の祭り、食文化の比較。',
          free: true,
        },
        {
          name: 'Career & Business',
          name_jp: 'キャリア・仕事',
          level: '中級',
          desc: 'ビジネス英語での自己紹介、職場文化の違い、キャリア目標。',
          free: false,
        },
        {
          name: 'Travel & Study Abroad',
          name_jp: '旅行・留学',
          level: '初級',
          desc: '旅行計画、交通機関、文化の違い、次の旅行のための会話練習。',
          free: false,
        },
      ],
    },
    testimonials: {
      section_label: 'メンバーの声',
      headline: 'リアルな交換。リアルな進歩。',
      items: [
        {
          quote:
            '3つのアプリを試したけど、毎回1回で終わってしまいました。BridgeTalkではAlexと12回目のセッションをしています。トピックカードが本当に助かっています。',
          name: '田中 雪（Yuki）',
          role: '大学生、東京 — 英語学習中',
          level: 'B1',
          sessions: 9,
        },
        {
          quote:
            'I\'ve tried three other apps and always got ghosted. With BridgeTalk, Yuki and I are on session 12. The topic cards changed everything.',
          name: 'Alex C.',
          role: 'ソフトウェアエンジニア、シアトル — 日本語学習中',
          level: 'B1',
          sessions: 12,
        },
        {
          quote:
            '毎週同じパートナーと練習できて、英語の自信がすごく上がりました。構造があるから何を話せばいいか迷わない。本当に続けられる。',
          name: '山本 愛里（Airi）',
          role: '英語教師、京都 — 英語学習中',
          level: 'B1',
          sessions: 21,
        },
      ],
    },
    for_who: {
      section_label: 'こんな方に',
      headline: '真剣な学習者のために。\n万人向けではありません。',
      for_items: [
        '日本語を学ぶ英語話者（A2〜B1レベル）で、定期的な会話パートナーを求めている方',
        '自然な英会話を練習したい日本語話者',
        '1回きりではなく、週1のセッションを続けられる方',
        'トピック・ノート・進捗管理などの構造を好む方',
        '出会いアプリ感のない、安心して学べる環境を求める方',
      ],
      not_for_items: [
        '目標のないカジュアルなチャット',
        '恋愛・出会いを求める方',
        '毎日多くの相手と話したい方',
        '準備せずに受動的に参加したい方',
      ],
    },
    faq: {
      section_label: 'よくある質問',
      headline: 'よくある質問',
      items: [
        {
          q: 'BridgeTalkは無料ですか？',
          a: 'はい — 基本的なマッチングとトライアルセッションは無料です。PlusとPremiumプランでは、キャリアトラック、セッション履歴、メンターレビューが利用できます。',
        },
        {
          q: 'パートナーが来なかった場合は？',
          a: '24時間前の連絡なしのドタキャンは、信頼スコアに影響します。繰り返しの場合はアカウントが制限される場合があります。',
        },
        {
          q: 'セッションの時間はどのくらいですか？',
          a: 'トライアルは15分。通常セッションは30分（各言語15分ずつ）。最大60分まで延長可能です。',
        },
        {
          q: '複数のパートナーを持てますか？',
          a: '無料プランは1名。Plusは3名まで。Premiumは無制限。1人の相手と続けることが最も効果的という研究結果をもとに設計しています。',
        },
        {
          q: 'ビデオ通話ですか、テキストですか？',
          a: 'ビデオ、音声のみ、テキストから選べます。多くのメンバーは自然な会話のためにビデオを選んでいます。',
        },
        {
          q: '対応言語は？',
          a: '現在のMVPでは、英語↔日本語の交換のみに特化しています。両国の学習者から最も需要が高いペアリングです。',
        },
      ],
    },
    waitlist: {
      headline: '語学パートナーを見つける準備はできましたか？',
      subheadline:
        '240名以上がすでに早期アクセスリストに登録済み。少人数のコホートでマッチングを開始します — 今すぐ申し込んでスポットを確保してください。',
      placeholder: 'メールアドレス',
      cta: 'ウェイトリストに登録',
      note: 'スパムなし。週1回以下のメール。いつでも退会可能。',
      success: '登録が完了しました！近日中にご連絡します。',
    },
    footer: {
      tagline: '真剣な学習者のための構造化語学交換。',
      links: ['使い方', '料金プラン', 'よくある質問', 'プライバシー', '利用規約'],
      copy: '© 2026 BridgeTalk. All rights reserved.',
    },
  },
} as const;

export type Translations = (typeof translations)['en'];
