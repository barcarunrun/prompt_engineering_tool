import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// Edge Runtime 互換の設定（Prisma を含まない）
export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isProtected =
        pathname.startsWith('/prompts') || pathname.startsWith('/users') || pathname.startsWith('/teams');
      const isSignupComplete = pathname === '/signup/complete';
      const isLoginVerify = pathname === '/login/verify';

      // 未ログインで保護ルートまたは登録完了ページ → ログインへ
      if (!isLoggedIn && (isProtected || isSignupComplete || isLoginVerify)) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
};
