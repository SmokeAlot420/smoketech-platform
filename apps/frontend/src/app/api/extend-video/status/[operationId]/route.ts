import { NextRequest, NextResponse } from 'next/server';
import { extensionOperations } from '../../operations-store';
// Trigger reload

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  const { operationId } = await params;

  if (!operationId) {
    return NextResponse.json(
      { success: false, error: 'Operation ID required' },
      { status: 400 }
    );
  }

  const operation = extensionOperations.get(operationId);

  if (!operation) {
    return NextResponse.json(
      { success: false, error: 'Operation not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    ...operation
  });
}
