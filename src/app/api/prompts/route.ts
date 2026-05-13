import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, getAuthUserScope, isAdminRole } from '@/lib/auth';

// GET /api/prompts — list all prompts
export async function GET() {
  const session = await auth();
  const userScope = getAuthUserScope(session);
  if (!userScope) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const where = isAdminRole(userScope.role)
    ? {}
    : userScope.teamId
      ? { teamId: userScope.teamId }
      : { id: { equals: '__no-access__' } };

  const prompts = await prisma.prompt.findMany({
    where,
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
  const userScope = getAuthUserScope(session);
  if (!userScope) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminRole(userScope.role) && !userScope.teamId) {
    return NextResponse.json({ error: 'Team assignment required' }, { status: 403 });
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
      userId: userScope.id,
      teamId: userScope.teamId,
      versions: {
        create: {
          version: 1,
          content: content || '',
          description: '初版作成',
          userId: userScope.id,
          teamId: userScope.teamId,
        },
      },
    },
  });

  return NextResponse.json(prompt, { status: 201 });
}
