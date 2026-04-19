import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/prompts/[id]/versions — list versions for a prompt
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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
