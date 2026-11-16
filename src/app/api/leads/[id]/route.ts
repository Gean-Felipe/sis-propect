import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
        scoreBreakdown: true,
        websiteChecks: {
          orderBy: { checkedAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        aiAnalyses: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
        proposals: {
          include: { service: true },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          orderBy: { dueAt: 'asc' },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      pipelineStage,
      dealValue,
      lostReason,
      notes,
      assignedUserId,
      segment,
      companyName,
      tradeName,
      bioLink,
    } = body;

    const currentLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!currentLead) {
      return NextResponse.json(
        { success: false, error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    // Se houve mudança no estágio do funil, registrar atividade na timeline
    if (pipelineStage && pipelineStage !== currentLead.pipelineStage) {
      await prisma.leadActivity.create({
        data: {
          leadId: params.id,
          type: 'STAGE_CHANGE',
          title: `Etapa alterada para "${pipelineStage.replace(/_/g, ' ')}"`,
          description: `Movimentado de ${currentLead.pipelineStage.replace(/_/g, ' ')} para ${pipelineStage.replace(/_/g, ' ')}.`,
        },
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(pipelineStage ? { pipelineStage } : {}),
        ...(dealValue !== undefined ? { dealValue: Number(dealValue) } : {}),
        ...(lostReason !== undefined ? { lostReason } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(assignedUserId !== undefined ? { assignedUserId } : {}),
        ...(segment ? { segment } : {}),
        ...(companyName ? { companyName } : {}),
        ...(tradeName ? { tradeName } : {}),
        ...(bioLink !== undefined ? { bioLink } : {}),
        lastContactAt: pipelineStage?.includes('CONTATO') ? new Date() : currentLead.lastContactAt,
      },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Lead excluído com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao excluir lead' },
      { status: 500 }
    );
  }
}
