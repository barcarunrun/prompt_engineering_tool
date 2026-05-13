import Image from 'next/image';
import React from 'react';

const authGuideSteps = [
  {
    img: '/how-to-use/auth-login.png',
    title: '1. ログイン',
    description:
      'Team ID と Team Password を入力し、「Microsoft アカウントでログイン」を押してサインインします。未登録の場合は「サインアップ」から新規登録へ進んでください。',
  },
  {
    img: '/how-to-use/auth-signup.png',
    title: '2. サインアップ',
    description:
      '初回利用時は Team Name / Team ID / Team Password を入力し、「Microsoft アカウントで登録」を押します。認証完了後、チームに紐づくアカウントとして利用できます。',
  },
];

export default function HowToAuthPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 8 }}>認証・ログインガイド</h1>
      <p style={{ color: '#555', marginTop: 0, marginBottom: 24 }}>
        このページでは、チームアカウントのログイン方法とサインアップ方法を説明します。
      </p>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {authGuideSteps.map((step, index) => (
          <li key={step.title} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: 12 }}>{step.title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 320, maxWidth: 680, flex: 1 }}>
                <Image
                  src={step.img}
                  alt={step.title}
                  width={1300}
                  height={730}
                  priority={index === 0}
                  style={{
                    width: '100%',
                    height: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)',
                  }}
                />
              </div>
              <p style={{ flex: 1, minWidth: 240, margin: 0, lineHeight: 1.8 }}>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <section
        style={{
          background: '#f8f9fb',
          border: '1px solid #eceff3',
          borderRadius: 10,
          padding: '16px 18px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: '1rem' }}>補足</h3>
        <p style={{ margin: 0, color: '#444', lineHeight: 1.7 }}>
          ログイン時に Team ID または Team Password が一致しない場合は、チーム管理者へ確認してください。
          新規チーム作成はサインアップ画面から行います。
        </p>
      </section>
    </main>
  );
}
