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

    const body = (await request.json()) as { teamLoginId?: string; teamPassword?: string };
    const teamLoginId = body.teamLoginId?.trim() ?? '';
    const teamPassword = body.teamPassword?.trim() ?? '';

    if (!teamLoginId || !teamPassword) {
      return NextResponse.json({ error: 'Team IDとTeam Passwordが必要です' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    if (!user.teamId) {
      return NextResponse.json({ error: 'チーム登録が必要です' }, { status: 403 });
    }

    const team = await prisma.team.findUnique({
      where: { teamLoginId },
    });

    if (!team || !team.teamPasswordHash || user.teamId !== team.id) {
      return NextResponse.json({ error: 'Team IDまたはTeam Passwordが一致しません' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(teamPassword, team.teamPasswordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Team IDまたはTeam Passwordが一致しません' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isRegistered: true },
    });

    return NextResponse.json({
      success: true,
      teamId: team.id,
      teamName: team.name,
      teamLoginId: team.teamLoginId,
    });
  } catch (error) {
    console.error('Team verification error:', error);
    return NextResponse.json({ error: '検証に失敗しました' }, { status: 500 });
  }
}
