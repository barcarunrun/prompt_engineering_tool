import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/prompts/[id] — get prompt with latest version
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const teamId = (session.user as { teamId?: string | null }).teamId;

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, teamId: true } },
      versions: {
        orderBy: { version: 'desc' },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!prompt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // チームが異なる場合はアクセス拒否
  if (teamId && prompt.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    id: prompt.id,
    name: prompt.name,
    description: prompt.description,
    content: prompt.content,
    modelId: prompt.modelId,
    status: prompt.status,
    latestVersion: prompt.latestVersion,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    createdBy: prompt.user?.name ?? '不明',
    versions: prompt.versions.map((v) => ({
      id: v.id,
      version: v.version,
      content: v.content,
      description: v.description,
      createdAt: v.createdAt.toISOString(),
      createdBy: v.user?.name ?? '不明',
    })),
  });
}

// PUT /api/prompts/[id] — save prompt (creates new version)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { content, description, modelId, name, status } = body;

  const existing = await prisma.prompt.findUnique({
    where: { id },
    include: { user: { select: { teamId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const teamId = (session.user as { teamId?: string | null }).teamId;
  if (teamId && existing.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newVersion = existing.latestVersion + 1;

  // Create new version and update prompt in a transaction
  const [prompt] = await prisma.$transaction([
    prisma.prompt.update({
      where: { id },
      data: {
        content: content ?? existing.content,
        modelId: modelId ?? existing.modelId,
        name: name ?? existing.name,
        status: status ?? existing.status,
        latestVersion: newVersion,
      },
    }),
    prisma.promptVersion.create({
      data: {
        promptId: id,
        version: newVersion,
        content: content ?? existing.content,
        description: description ?? `v${newVersion} 保存`,
        userId: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ ...prompt, latestVersion: newVersion });
}
