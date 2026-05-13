import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, canAccessTeamScopedResource, getAuthUserScope } from '@/lib/auth';

// GET /api/prompts/[id]/versions — list versions for a prompt
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userScope = getAuthUserScope(session);
  if (!userScope) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { teamId: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!canAccessTeamScopedResource(userScope, prompt.teamId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const versions = await prisma.promptVersion.findMany({
    where: { promptId: id },
    orderBy: { version: 'desc' },
    include: { user: { select: { name: true } } },
  });

  const result = versions.map((v) => ({
    id: v.id,
    version: v.version,
    content: v.content,
    description: v.description,
    createdAt: v.createdAt.toISOString(),
    createdBy: v.user?.name ?? '不明',
  }));

  return NextResponse.json(result);
}
