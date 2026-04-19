import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/target-text-sets — list all
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = (session.user as { teamId?: string | null }).teamId;

  const sets = await prisma.targetTextSet.findMany({
    where: teamId ? { user: { teamId } } : { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  const result = sets.map((s) => ({
    id: s.id,
    name: s.name,
    textCount: (JSON.parse(s.texts) as string[]).length,
    userName: s.user.name,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return NextResponse.json(result);
}

// POST /api/target-text-sets — create
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, texts } = body as { name: string; texts: string[] };

  if (!name?.trim() || !Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: '名前とテキスト配列は必須です' }, { status: 400 });
  }

  const set = await prisma.targetTextSet.create({
    data: {
      name: name.trim(),
      texts: JSON.stringify(texts),
      userId: session.user.id,
    },
  });

  return NextResponse.json({ id: set.id }, { status: 201 });
}
