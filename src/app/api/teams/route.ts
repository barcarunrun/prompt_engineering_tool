import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: 'チームの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // admin only
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { name, password } = await request.json();

    if (!name?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'チーム名とパスワードは必須です' }, { status: 400 });
    }

    const existing = await prisma.team.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'このチーム名は既に使用されています' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        password: hashedPassword,
      },
    });

    return NextResponse.json({ id: team.id, name: team.name, createdAt: team.createdAt });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: 'チームの作成に失敗しました' }, { status: 500 });
  }
}
