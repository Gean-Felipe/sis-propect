import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { analyzeLeadWithAi } from '@/lib/ai-engine';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'gfsites_secret_key_prospect_2026';

    if (apiKey && apiKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar leads prioritários aguardando primeira abordagem
    const leads = await prisma.lead.findMany({
      where: {
        pipelineStage: { in: ['NOVO_LEAD', 'LEAD_ANALISADO', 'AGUARDANDO_ABORDAGEM'] },
        leadScore: { gte: 70 },
      },
      include: {
        contacts: true,
        aiAnalyses: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { leadScore: 'desc' },
      take: 10,
    });

    const queue = [];

    for (const lead of leads) {
      const whatsappContact = lead.contacts.find((c) => c.type === 'WHATSAPP');
      if (!whatsappContact || !whatsappContact.value) continue;

      let cleanPhone = whatsappContact.value.replace(/\D/g, '');
      if (!cleanPhone.startsWith('55')) {
        cleanPhone = `55${cleanPhone}`;
      }

      // Se já possui análise de IA, usa a mensagem existente; caso contrário, gera na hora
      let pitchMessage = lead.aiAnalyses?.[0]?.personalizedPitch;

      if (!pitchMessage) {
        const analysis = await analyzeLeadWithAi({
          companyName: lead.companyName,
          username: lead.username,
          bio: lead.bio,
          bioLink: lead.bioLink,
          segment: lead.segment,
          websiteStatus: lead.websiteStatus,
          followersCount: lead.followersCount,
          city: lead.city,
          state: lead.state,
          whatsapp: cleanPhone,
        });

        await prisma.aiAnalysis.create({
          data: {
            leadId: lead.id,
            identifiedSegment: analysis.identifiedSegment,
            digitalDiagnosis: analysis.digitalDiagnosis,
            commercialPain: analysis.commercialPain,
            suggestedServices: JSON.stringify(analysis.suggestedServices),
            personalizedPitch: analysis.personalizedPitch,
            recommendedNextStep: analysis.recommendedNextStep,
          },
        });

        pitchMessage = analysis.personalizedPitch;
      }

      queue.push({
        leadId: lead.id,
        companyName: lead.companyName,
        username: lead.username,
        segment: lead.segment,
        city: lead.city,
        state: lead.state,
        whatsappNumber: cleanPhone,
        pitchMessage,
        leadScore: lead.leadScore,
        websiteStatus: lead.websiteStatus,
      });
    }

    return NextResponse.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error: any) {
    console.error('Erro ao listar fila de envio do n8n:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'gfsites_secret_key_prospect_2026';

    if (apiKey && apiKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, sentMessage, status = 'SENT', errorMessage } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId é obrigatório' }, { status: 400 });
    }

    if (status === 'SENT') {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          pipelineStage: 'PRIMEIRO_CONTATO',
          firstContactAt: new Date(),
          lastContactAt: new Date(),
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId,
          type: 'MESSAGE_SENT',
          title: 'Abordagem automática enviada via n8n (WhatsApp)',
          description: `Disparo agendado das 08h00 (horário de Cuiabá/MT) executado com sucesso. Mensagem enviada: "${sentMessage ? sentMessage.substring(0, 150) + '...' : ''}"`,
          channel: 'WHATSAPP',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Lead atualizado para PRIMEIRO_CONTATO e atividade registrada.',
      });
    } else {
      await prisma.leadActivity.create({
        data: {
          leadId,
          type: 'NOTE',
          title: 'Falha no envio automático via n8n',
          description: `Erro ao enviar WhatsApp: ${errorMessage || 'Falha não especificada'}`,
          channel: 'WHATSAPP',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Falha registrada no histórico do lead.',
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
