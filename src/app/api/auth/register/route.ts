import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { name } = await request.json();

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        isRegistered: true,
        ...(name ? { name } : {}),
      },
      create: {
        email: session.user.email,
        name: name || session.user.name || null,
        role: 'member',
        isRegistered: true,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 500 }
    );
  }
}
