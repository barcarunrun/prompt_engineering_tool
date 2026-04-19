import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { executeLLM, substituteVariables } from '@/lib/llm';

// POST /api/prompts/[id]/execute — execute prompt against LLM
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { targetText, variables, modelId } = body as {
    targetText?: string;
    variables?: Record<string, string>;
    modelId?: string;
  };

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: { user: { select: { teamId: true } } },
  });
  if (!prompt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const teamId = (session.user as { teamId?: string | null }).teamId;
  if (teamId && prompt.user?.teamId !== teamId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const model = modelId ?? prompt.modelId;

  // Substitute variables in prompt content
  let processedPrompt = prompt.content;
  if (variables && Object.keys(variables).length > 0) {
    processedPrompt = substituteVariables(processedPrompt, variables);
  }

  try {
    const result = await executeLLM(model, processedPrompt, targetText ?? '');

    // Save execution record
    await prisma.promptExecution.create({
      data: {
        promptId: id,
        modelId: model,
        input: targetText ?? '',
        output: result.output,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
      },
    });

    return NextResponse.json({
      output: result.output,
      model,
      tokenUsage: {
        prompt: result.promptTokens,
        completion: result.completionTokens,
        total: result.totalTokens,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'LLM execution failed';
    console.error('LLM execution error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
