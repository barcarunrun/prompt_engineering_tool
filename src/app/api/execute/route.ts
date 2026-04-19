import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeLLM, substituteVariables } from '@/lib/llm';

// POST /api/execute — execute prompt directly (without saving to DB)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, targetText, variables, modelId } = body as {
    prompt: string;
    targetText?: string;
    variables?: Record<string, string>;
    modelId: string;
  };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  // Substitute variables in prompt content
  let processedPrompt = prompt;
  if (variables && Object.keys(variables).length > 0) {
    processedPrompt = substituteVariables(processedPrompt, variables);
  }

  try {
    const result = await executeLLM(modelId, processedPrompt, targetText ?? '');

    return NextResponse.json({
      output: result.output,
      model: modelId,
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
