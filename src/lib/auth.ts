import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      await prisma.user.upsert({
        where: { email: user.email },
        update: { isRegistered: true },
        create: {
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: 'member',
          isRegistered: true,
        },
      });
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role ?? 'viewer';
        token.isRegistered = (user as { isRegistered?: boolean }).isRegistered ?? false;
        token.teamId = (user as { teamId?: string | null }).teamId ?? null;
      }
      // セッション更新時にDBから最新を取得
      if (trigger === 'update' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.isRegistered = dbUser.isRegistered;
          token.role = dbUser.role;
          token.teamId = dbUser.teamId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isRegistered?: boolean }).isRegistered = token.isRegistered as boolean;
        (session.user as { teamId?: string | null }).teamId = (token.teamId as string | null) ?? null;
      }
      return session;
    },
  },
});
