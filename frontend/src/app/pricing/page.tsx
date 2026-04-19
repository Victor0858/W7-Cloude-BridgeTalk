'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLang } from '@/contexts/LanguageContext';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    name_jp: '無料',
    price_mo: 0,
    price_yr: 0,
    badge: null,
    tagline: 'Get started, no commitment',
    tagline_jp: '気軽に始められる',
    features: [
      'Waitlist / early access signup',
      'Basic profile & onboarding',
      '1 active partner match',
      '2 free topic packs (Daily Life, Anime)',
      '15-min trial sessions',
      'Session notes (basic)',
      'Community guidelines & safety',
    ],
    features_jp: [
      'ウェイトリスト / 早期アクセス',
      '基本プロフィール作成',
      'アクティブパートナー1名',
      '無料トピックパック2種（日常・アニメ）',
      '15分トライアルセッション',
      'セッションノート（基本）',
      'コミュニティガイドライン準拠',
    ],
    cta: 'Join for Free',
    cta_jp: '無料で始める',
    cta_href: '/onboarding',
    highlight: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    name_jp: 'プラス',
    price_mo: 12,
    price_yr: 9,
    badge: 'Most Popular',
    badge_jp: '人気No.1',
    tagline: 'For committed weekly learners',
    tagline_jp: '週1で真剣に練習したい方',
    features: [
      'Everything in Free',
      'Up to 3 active partners',
      'All 4 topic pack categories',
      'Session history & notes archive',
      'Priority matching algorithm',
      'Reliability score + vouch system',
      'Progress tracking dashboard',
      'Weekly session reminders',
    ],
    features_jp: [
      '無料プランの全機能',
      'アクティブパートナー最大3名',
      '全4種のトピックパック',
      'セッション履歴とノートアーカイブ',
      '優先マッチングアルゴリズム',
      '信頼スコア + 評価システム',
      '進捗トラッキングダッシュボード',
      '週次セッションリマインダー',
    ],
    cta: 'Start Plus',
    cta_jp: 'プラスを始める',
    cta_href: '/onboarding',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    name_jp: 'プレミアム',
    price_mo: 29,
    price_yr: 22,
    badge: null,
    tagline: 'For serious career learners',
    tagline_jp: 'キャリアに英語を活かしたい方',
    features: [
      'Everything in Plus',
      'Unlimited active partners',
      'Mentor review sessions (2/month)',
      'Job interview practice track',
      'Business conversation track',
      'TOEIC / JLPT prep prompts',
      'Custom session templates',
      'Priority support',
    ],
    features_jp: [
      'プラスプランの全機能',
      'アクティブパートナー無制限',
      'メンターレビューセッション（月2回）',
      '就職面接練習トラック',
      'ビジネス英会話トラック',
      'TOEIC / JLPT 対策プロンプト',
      'カスタムセッションテンプレート',
      '優先サポート',
    ],
    cta: 'Start Premium',
    cta_jp: 'プレミアムを始める',
    cta_href: '/onboarding',
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  { feature: 'Active partners', free: '1', plus: 'Up to 3', premium: 'Unlimited' },
  { feature: 'Topic packs', free: '2 (Free)', plus: 'All 4', premium: 'All + Custom' },
  { feature: 'Session history', free: 'Last 3', plus: 'Full archive', premium: 'Full + Export' },
  { feature: 'Mentor review', free: '✗', plus: '✗', premium: '2 / month' },
  { feature: 'Career track', free: '✗', plus: '✗', premium: '✓' },
  { feature: 'Priority matching', free: '✗', plus: '✓', premium: '✓' },
  { feature: 'Reliability score', free: 'Basic', plus: 'Full', premium: 'Full' },
];

export default function PricingPage() {
  const { lang } = useLang();
  const [annual, setAnnual] = useState(false);
  const jp = lang === 'ja';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
            {jp ? '料金プラン' : 'Pricing'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
            {jp ? '目標に合ったプランを' : 'Simple, honest pricing.'}
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            {jp
              ? '全プランにトライアルあり。クレジットカード不要で始められます。'
              : 'Start free, upgrade when you\'re ready. No hidden fees, no confusing tiers.'}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 mt-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {jp ? '月払い' : 'Monthly'}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {jp ? '年払い' : 'Annual'}
              <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                {jp ? '2ヶ月無料' : 'Save 25%'}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const price = annual ? plan.price_yr : plan.price_mo;
            const features = jp ? plan.features_jp : plan.features;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border flex flex-col relative ${
                  plan.highlight
                    ? 'border-brand-600 shadow-xl shadow-brand-100 bg-white ring-2 ring-brand-600'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      {jp ? plan.badge_jp : plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <p className="font-black text-xl text-slate-900">{jp ? plan.name_jp : plan.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{jp ? plan.tagline_jp : plan.tagline}</p>
                </div>

                <div className="mb-6">
                  {price === 0 ? (
                    <span className="text-4xl font-black text-slate-900">{jp ? '無料' : 'Free'}</span>
                  ) : (
                    <div>
                      <span className="text-4xl font-black text-slate-900">${price}</span>
                      <span className="text-slate-500 text-sm">
                        {jp ? '/月' : '/mo'}{annual && <span className="ml-1 text-xs text-green-600">(billed annually)</span>}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-brand-600' : 'text-green-500'}`}>
                        {f === '✗' ? '·' : '✓'}
                      </span>
                      <span className={f === '✗' || f === '×' ? 'text-slate-400' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.cta_href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200'
                      : 'border border-gray-200 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {jp ? plan.cta_jp : plan.cta}
                </Link>

                {plan.price_mo > 0 && (
                  <p className="text-center text-xs text-slate-400 mt-2">
                    {jp ? 'クレジットカード不要・いつでもキャンセル可' : 'No credit card required · Cancel anytime'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
            {jp ? '機能比較' : 'Feature Comparison'}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 font-semibold text-slate-700 w-1/2">
                    {jp ? '機能' : 'Feature'}
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={`p-4 text-center font-bold ${p.highlight ? 'text-brand-600' : 'text-slate-700'}`}>
                      {jp ? p.name_jp : p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-4 text-slate-700">{row.feature}</td>
                    {[row.free, row.plus, row.premium].map((val, j) => (
                      <td key={j} className={`p-4 text-center font-medium ${
                        val === '✗' ? 'text-gray-300' :
                        val === '✓' ? 'text-green-500' :
                        'text-slate-800'
                      }`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
            {jp ? 'よくある質問' : 'Pricing FAQ'}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: jp ? 'いつでもキャンセルできますか？' : 'Can I cancel anytime?',
                a: jp ? 'はい。いつでも、理由なしにキャンセル可能です。請求サイクル終了後も機能はご利用いただけます。' : 'Yes, cancel anytime with no questions asked. Your features remain active until the end of your billing cycle.',
              },
              {
                q: jp ? 'プランのアップグレードはいつでもできますか？' : 'Can I upgrade or downgrade?',
                a: jp ? 'もちろんです。アップグレードはすぐに反映されます。ダウングレードは次回請求サイクルから適用されます。' : 'Yes. Upgrades take effect immediately. Downgrades apply at your next billing cycle.',
              },
              {
                q: jp ? '現在は実際の決済はないですか？' : 'Is payment actually charged in this MVP?',
                a: jp ? 'いいえ。このMVPでは決済機能は実装されていません。将来的にStripeを統合する予定です。' : 'No. Payment processing is a placeholder in this MVP. We\'ll integrate Stripe before public launch.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4">
                <p className="font-semibold text-slate-900 mb-1">{item.q}</p>
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-slate-900 rounded-2xl p-10">
          <h2 className="text-2xl font-black text-white mb-3">
            {jp ? 'まずは無料で始めましょう' : 'Start free. Upgrade when you\'re ready.'}
          </h2>
          <p className="text-slate-400 mb-6">
            {jp ? 'クレジットカード不要。5分でプロフィール作成完了。' : 'No credit card required. Build your profile in 5 minutes.'}
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-900/50"
          >
            {jp ? '無料で始める →' : 'Get Started Free →'}
          </Link>
        </div>
      </main>
    </div>
  );
}
