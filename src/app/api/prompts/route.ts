import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/prompts — list all prompts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = (session.user as { teamId?: string | null }).teamId;

  const prompts = await prisma.prompt.findMany({
    where: teamId ? { user: { teamId } } : { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  const result = prompts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    content: p.content,
    modelId: p.modelId,
    status: p.status,
    latestVersion: p.latestVersion,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    createdBy: p.user?.name ?? '不明',
  }));

  return NextResponse.json(result);
}

// POST /api/prompts — create a new prompt
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, content, modelId } = body;

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const prompt = await prisma.prompt.create({
    data: {
      name,
      description: description ?? '',
      content: content || '',
      modelId: modelId ?? 'gpt-4.1',
      status: 'draft',
      latestVersion: 1,
      userId: session.user.id,
      versions: {
        create: {
          version: 1,
          content: content || '',
          description: '初版作成',
          userId: session.user.id,
        },
      },
    },
  });

  return NextResponse.json(prompt, { status: 201 });
}
