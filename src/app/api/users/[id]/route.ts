import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { teamId, role } = body as { teamId?: string | null; role?: string };

    const data: { teamId?: string | null; role?: string } = {};
    if ('teamId' in body) data.teamId = teamId ?? null;
    if (role !== undefined) {
      if (!['admin', 'member', 'viewer'].includes(role)) {
        return NextResponse.json({ error: '無効なロールです' }, { status: 400 });
      }
      data.role = role;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, teamId: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'ユーザの更新に失敗しました' }, { status: 500 });
  }
}
