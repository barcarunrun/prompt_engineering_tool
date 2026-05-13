import type { Metadata } from 'next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import HistoryIcon from '@mui/icons-material/History';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';

export const metadata: Metadata = {
  title: 'LLM向けプロンプト管理ツール | Prompt Engineering Tool',
  description:
    'プロンプトの作成・検証・バージョン管理・複数LLM比較を1つで実現。完全無料でチーム利用にも対応。',
  openGraph: {
    title: 'LLM向けプロンプト管理ツール | Prompt Engineering Tool',
    description:
      'プロンプトの作成・検証・バージョン管理・複数LLM比較を1つで実現。完全無料でチーム利用にも対応。',
    type: 'website',
    url: '/lp',
  },
};

const painPoints = [
  'プロンプトが属人化し、誰が何を変えたか分からない',
  'どのバージョンのプロンプトが最も効果的か判断できない',
  'LLMモデルごとの出力品質の比較に手間がかかる',
  'プロンプトのテスト作業が手動で非効率',
];

const features = [
  {
    icon: <BoltIcon color="primary" />,
    title: 'プロンプト作成・検証',
    description: 'テンプレート変数対応。ワンクリックで実行＆結果確認。',
  },
  {
    icon: <HistoryIcon color="primary" />,
    title: 'バージョン管理',
    description: '変更履歴を時系列管理。過去バージョンへのワンクリック復元。',
  },
  {
    icon: <CompareArrowsIcon color="primary" />,
    title: '複数LLM対応',
    description: 'OpenAI / Groq など複数プロバイダーを切り替えて比較。',
  },
  {
    icon: <BarChartIcon color="primary" />,
    title: '一括検証',
    description: '複数テキストへの一括実行。結果をCSVダウンロード。',
  },
];

const consultingServices = [
  {
    title: 'プロンプト設計支援',
    description: '業務に最適化されたプロンプトの設計・チューニング。',
  },
  {
    title: 'LLM業務組込みコンサル',
    description: '既存業務フローへのLLM統合の企画・実装支援。',
  },
  {
    title: 'RAG / エージェント構築',
    description: '社内ナレッジを活用したRAGシステムやAIエージェントの構築。',
  },
  {
    title: '社内研修・ワークショップ',
    description: 'エンジニア・非エンジニア向けのLLM活用トレーニング。',
  },
];

const faqs = [
  {
    question: '本当に無料ですか？',
    answer:
      'はい。すべての機能を無料でご利用いただけます。LLM APIキーはお客様ご自身でご用意ください。',
  },
  {
    question: 'どのLLMに対応していますか？',
    answer: 'OpenAI（GPT-5.4シリーズ）、Groq（Llama 3.xシリーズ）などに対応しています。',
  },
  {
    question: 'データのセキュリティは？',
    answer: 'Azure上でホスティングされ、Microsoft Entra IDによる認証を採用しています。',
  },
  {
    question: 'コンサルティングだけの依頼も可能ですか？',
    answer: 'はい、ツールをご利用いただかなくてもコンサルのみのご依頼も承ります。',
  },
];

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255, 255, 255, 0.86)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Prompt Engineering Tool</Typography>
            <Stack direction="row" spacing={1.5}>
              <Button href="/login" color="inherit">
                ログイン
              </Button>
              <Button href="/signup" variant="contained">
                無料で始める
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, #e3f2fd 0%, #f5f5f5 80%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip label="完全無料・チーム対応" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                プロンプトの管理、
                <br />
                まだスプレッドシートですか？
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
                チームのプロンプトを一元管理。作成・テスト・バージョン管理をこれひとつで。
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button href="/signup" variant="contained" size="large">
                  無料で始める
                </Button>
                <Button
                  component="a"
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="large"
                >
                  DX支援について相談する
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ boxShadow: 6 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    ダッシュボードイメージ
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
                      Prompt A/B Test: Success Rate +18%
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      GPT-5.4 vs Llama 3.x 比較結果
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      変更履歴: v1.2.0 → v1.3.0
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      Batch Verify: 128件完了 / CSV出力
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          LLM活用、こんな課題ありませんか？
        </Typography>
        <Grid container spacing={2}>
          {painPoints.map((point) => (
            <Grid key={point} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body1">• {point}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box component="section" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            すべて解決する、プロンプト管理プラットフォーム
          </Typography>
          <Grid container spacing={2.5}>
            {features.map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                      {feature.icon}
                      <Typography variant="h6">{feature.title}</Typography>
                    </Stack>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          チームでの利用に最適化
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SecurityIcon color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Microsoft Entra ID 対応
                </Typography>
                <Typography color="text.secondary">SSOで安全かつスムーズに導入できます。</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <GroupsIcon color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ロールベース権限管理
                </Typography>
                <Typography color="text.secondary">admin / member / viewer で統制できます。</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <RocketLaunchIcon color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  チーム単位で共有
                </Typography>
                <Typography color="text.secondary">知見を蓄積し、再現可能な運用を作れます。</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box component="section" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 3 }}>
            完全無料で、すべての機能が使えます
          </Typography>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                フリープラン: ¥0
              </Typography>
              <Stack spacing={1.2} sx={{ mb: 2.5 }}>
                {[
                  'プロンプト管理・検証（無制限）',
                  'バージョン履歴',
                  '複数LLM対応',
                  '一括検証・CSVエクスポート',
                  'チーム管理・SSO',
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                ※ LLM APIキーはお客様ご自身でご用意ください
              </Typography>
              <Typography color="text.secondary">
                私たちはツール提供を通じてLLM活用の普及を支援し、より高度なDX推進をコンサルティングでお手伝いしています。
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
          LLMをもっとビジネスに活かしたい方へ
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3.5 }}>
          ツールだけでは解決できない、業務プロセスへのLLM組み込みを専門チームが支援します。
        </Typography>
        <Grid container spacing={2}>
          {consultingServices.map((service) => (
            <Grid key={service.title} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {service.title}
                  </Typography>
                  <Typography color="text.secondary">{service.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          component="a"
          href="https://calendly.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >
          まずは無料相談する
        </Button>
      </Container>

      <Box component="section" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
            3ステップで始められます
          </Typography>
          <Grid container spacing={2}>
            {[
              ['1', 'アカウント作成', 'メールアドレスまたはMicrosoft Entra IDでサインアップ'],
              ['2', 'チーム作成', 'チームを作成し、メンバーを招待'],
              ['3', 'プロンプト管理開始', 'プロンプトを登録して検証スタート'],
            ].map(([step, title, description]) => (
              <Grid key={step} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Chip label={`STEP ${step}`} color="primary" size="small" sx={{ mb: 1 }} />
                    <Typography variant="h6" sx={{ mb: 0.8 }}>
                      {title}
                    </Typography>
                    <Typography color="text.secondary">{description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          FAQ
        </Typography>
        <Stack spacing={2}>
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <HelpIcon color="primary" fontSize="small" />
                  <Typography variant="h6">{faq.question}</Typography>
                </Stack>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          color: '#fff',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            LLM活用の第一歩を、今日から
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button href="/signup" variant="contained" color="secondary" size="large">
              無料で始める
            </Button>
            <Button
              component="a"
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{ borderColor: '#fff', color: '#fff' }}
            >
              DX支援について相談する
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Prompt Engineering Tool
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="small" color="inherit" component="a" href="#">
                会社情報
              </Button>
              <Button size="small" color="inherit" component="a" href="#">
                プライバシーポリシー
              </Button>
              <Button size="small" color="inherit" component="a" href="#">
                利用規約
              </Button>
              <Button size="small" color="inherit" component="a" href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                お問い合わせ
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
