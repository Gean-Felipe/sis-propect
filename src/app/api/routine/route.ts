import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Leads para abordar hoje (sem site, alta prioridade, ainda não abordados)
    const toApproachToday = await prisma.lead.findMany({
      where: {
        pipelineStage: { in: ['NOVO_LEAD', 'LEAD_ANALISADO', 'AGUARDANDO_ABORDAGEM'] },
        leadScore: { gte: 70 },
      },
      include: { contacts: true },
      orderBy: { leadScore: 'desc' },
      take: 8,
    });

    // 2. Respostas aguardadas e em negociação
    const awaitingResponse = await prisma.lead.findMany({
      where: {
        pipelineStage: { in: ['PRIMEIRO_CONTATO', 'EM_NEGOCIACAO'] },
      },
      include: { contacts: true },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });

    // 3. Propostas que precisam de retorno
    const pendingProposals = await prisma.lead.findMany({
      where: {
        pipelineStage: 'PROPOSTA_ENVIADA',
      },
      include: {
        contacts: true,
        proposals: { where: { status: 'SENT' } },
      },
      orderBy: { updatedAt: 'asc' },
    });

    // 4. Follow-ups agendados
    const followUps = await prisma.followUpTask.findMany({
      where: { status: 'PENDING' },
      include: {
        lead: {
          include: { contacts: true },
        },
      },
      orderBy: { dueAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      routine: {
        toApproachToday,
        awaitingResponse,
        pendingProposals,
        followUps,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
