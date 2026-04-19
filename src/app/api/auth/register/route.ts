import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { name, teamId, teamPassword } = await request.json();

    // Team検証
    if (!teamId || !teamPassword) {
      return NextResponse.json({ error: 'Team IDとTeam Passwordは必須です' }, { status: 400 });
    }

    // teamIdがidまたはnameに一致するTeamを検索
    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: teamId }, { name: teamId }],
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team IDが見つかりません' }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(teamPassword, team.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Team Passwordが正しくありません' }, { status: 400 });
    }

    // upsert: ユーザーが存在しない場合は作成、存在する場合は更新
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        isRegistered: true,
        role: 'member',
        teamId: team.id,
        ...(name ? { name } : {}),
      },
      create: {
        email: session.user.email,
        name: name || session.user.name || null,
        role: 'member',
        isRegistered: true,
        teamId: team.id,
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
