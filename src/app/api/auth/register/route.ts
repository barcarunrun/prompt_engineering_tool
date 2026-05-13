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

    const body = (await request.json()) as {
      name?: string;
      teamName?: string;
      teamLoginId?: string;
      teamPassword?: string;
    };

    const teamName = body.teamName?.trim() ?? '';
    const teamLoginId = body.teamLoginId?.trim() ?? '';
    const teamPassword = body.teamPassword?.trim() ?? '';

    if (!teamName || !teamLoginId || !teamPassword) {
      return NextResponse.json(
        { error: 'チーム名・Team ID・Team Passwordは必須です' },
        { status: 400 }
      );
    }

    if (teamPassword.length < 8) {
      return NextResponse.json(
        { error: 'Team Passwordは8文字以上で入力してください' },
        { status: 400 }
      );
    }

    const existing = await prisma.team.findUnique({ where: { teamLoginId } });
    if (existing) {
      return NextResponse.json({ error: 'このTeam IDは既に使用されています' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(teamPassword, 12);

    const result = await prisma.$transaction(async (transaction) => {
      const team = await transaction.team.create({
        data: {
          name: teamName,
          teamLoginId,
          teamPasswordHash: passwordHash,
        },
      });

      const user = await transaction.user.upsert({
        where: { email: session.user.email },
        update: {
          isRegistered: true,
          teamId: team.id,
          ...(body.name ? { name: body.name } : {}),
        },
        create: {
          email: session.user.email,
          name: body.name || session.user.name || null,
          role: 'member',
          isRegistered: true,
          teamId: team.id,
        },
      });

      return { team, user };
    });

    return NextResponse.json({
      success: true,
      user: { id: result.user.id, name: result.user.name },
      team: { id: result.team.id, name: result.team.name, teamLoginId: result.team.teamLoginId },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登録に失敗しました' },
      { status: 500 }
    );
  }
}
