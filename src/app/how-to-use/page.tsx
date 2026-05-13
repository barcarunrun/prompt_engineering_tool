// 画像は public/how-to-use/step1.png 〜 step6.png として参照します。
// 必要に応じて画像ファイルを配置してください。

import Image from 'next/image';
import React from 'react';

const steps = [
  {
    img: '/how-to-use/step1.png',
    title: '1. プロンプト一覧',
    desc: '作成済みのプロンプトが一覧表示されます。ここから新規作成や既存プロンプトの検証が可能です。',
  },
  {
    img: '/how-to-use/step2.png',
    title: '2. プロンプト検証',
    desc: 'プロンプトの内容や適用テキストを入力し、LLMモデルを選択して一括検証ができます。',
  },
  {
    img: '/how-to-use/step3.png',
    title: '3. プロンプト詳細・バージョン管理',
    desc: 'プロンプトの詳細内容やバージョン履歴を確認できます。適用テキストを入力して実行結果も確認可能です。',
  },
  {
    img: '/how-to-use/step4.png',
    title: '4. 適用テキストJSON作成',
    desc: 'LLMに指示を出して、適用テキストのJSON配列を自動生成できます。ファイルからのインポートやダウンロードも可能です。',
  },
  {
    img: '/how-to-use/step5.png',
    title: '5. 保存済み適用テキスト一覧',
    desc: '保存した適用テキストJSONの一覧です。編集や削除、内容の確認ができます。',
  },
];

export default function HowToUsePage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 24 }}>サービスの使い方ガイド</h1>
      <ol style={{ listStyle: 'none', padding: 0 }}>
        {steps.map((step, idx) => (
          <li key={idx} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8 }}>{step.title}</h2>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 320, maxWidth: 600 }}>
                <Image
                  src={step.img}
                  alt={step.title}
                  width={800}
                  height={400}
                  style={{ width: '100%', height: 'auto', border: '1px solid #eee', borderRadius: 8 }}
                />
              </div>
              <p style={{ flex: 1, minWidth: 200, margin: 0 }}>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
