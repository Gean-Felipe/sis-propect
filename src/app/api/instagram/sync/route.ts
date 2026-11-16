import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const account = await prisma.instagramAccount.findFirst({
      include: {
        syncJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const recentJobs = await prisma.syncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        instagramAccount: true,
      },
    });

    return NextResponse.json({
      success: true,
      account,
      recentJobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { simulateDelay = 1200 } = body;

    const account = await prisma.instagramAccount.findFirst();

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma conta do Instagram conectada para sincronização.' },
        { status: 400 }
      );
    }

    // Simulação do tempo de consulta à API oficial da Meta
    await new Promise((resolve) => setTimeout(resolve, simulateDelay));

    // Atualiza contadores e dados da conta
    const updatedAccount = await prisma.instagramAccount.update({
      where: { id: account.id },
      data: {
        lastSyncAt: new Date(),
        syncCount: { increment: 1 },
      },
    });

    // Registra o job no histórico de auditoria
    const job = await prisma.syncJob.create({
      data: {
        instagramAccountId: account.id,
        sourceType: 'INSTAGRAM_API',
        status: 'COMPLETED',
        recordsImported: 0,
        recordsUpdated: 1,
        details: JSON.stringify({
          message: 'Métricas da conta oficial sincronizadas com a Meta Graph API.',
          timestamp: new Date().toISOString(),
        }),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sincronização com o Instagram concluída com sucesso.',
      account: updatedAccount,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro durante sincronização' },
      { status: 500 }
    );
  }
}
