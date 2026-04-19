import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team IDが必要です' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    if (!user.teamId) {
      return NextResponse.json({ error: 'チームに所属していません' }, { status: 403 });
    }

    // teamIdがTeamのidまたはnameに一致するか確認
    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: teamId }, { name: teamId }],
      },
    });

    if (!team || user.teamId !== team.id) {
      return NextResponse.json({ error: 'Team IDが一致しません' }, { status: 403 });
    }

    return NextResponse.json({ success: true, teamId: team.id, teamName: team.name });
  } catch (error) {
    console.error('Team verification error:', error);
    return NextResponse.json({ error: '検証に失敗しました' }, { status: 500 });
  }
}
