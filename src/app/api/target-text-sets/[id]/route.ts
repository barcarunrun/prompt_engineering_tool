import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/target-text-sets/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = (session.user as { teamId?: string | null }).teamId;

  const set = await prisma.targetTextSet.findUnique({
    where: { id },
    include: { user: { select: { teamId: true } } },
  });
  if (!set) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (teamId && set.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    id: set.id,
    name: set.name,
    texts: JSON.parse(set.texts) as string[],
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
  });
}

// PUT /api/target-text-sets/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = (session.user as { teamId?: string | null }).teamId;

  const existing = await prisma.targetTextSet.findUnique({
    where: { id },
    include: { user: { select: { teamId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (teamId && existing.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, texts } = body as { name?: string; texts?: string[] };

  const data: Record<string, string> = {};
  if (name?.trim()) data.name = name.trim();
  if (Array.isArray(texts)) data.texts = JSON.stringify(texts);

  const set = await prisma.targetTextSet.update({
    where: { id },
    data,
  });

  return NextResponse.json({ id: set.id });
}

// DELETE /api/target-text-sets/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = (session.user as { teamId?: string | null }).teamId;

  const existing = await prisma.targetTextSet.findUnique({
    where: { id },
    include: { user: { select: { teamId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (teamId && existing.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.targetTextSet.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
