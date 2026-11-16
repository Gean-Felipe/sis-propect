import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') ||
                   request.headers.get('X-API-Key') ||
                   request.headers.get('authorization')?.replace(/Bearer\s+/i, '') ||
                   request.nextUrl.searchParams.get('api_key');

    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'gfsites_secret_key_prospect_2026';

    // Se fornecida chave diferente da esperada, bloqueia
    if (apiKey && apiKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Chave de API inválida' }, { status: 401 });
    }

    // Consulta otimizada e direta ao banco de dados SQLite
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
      take: 15,
    });

    const queue = leads.map((lead) => {
      const whatsappContact = lead.contacts.find((c) => c.type === 'WHATSAPP');
      let cleanPhone = whatsappContact?.value ? whatsappContact.value.replace(/\D/g, '') : '';
      if (cleanPhone && !cleanPhone.startsWith('55')) {
        cleanPhone = `55${cleanPhone}`;
      }

      // Script de abordagem pré-formatado instantâneo
      const locationText = [lead.city, lead.state].filter(Boolean).join(' - ');
      const existingPitch = lead.aiAnalyses?.[0]?.personalizedPitch;

      const fallbackPitch = `Olá! Tudo bem? Me chamo Gean, sou responsável pela GFSites & Automações. Conheci o trabalho da ${lead.companyName} pelo Instagram e gostei muito da atuação de vocês${locationText ? ` em ${locationText}` : ''}. Notei que vocês ainda não possuem um site profissional próprio no Google. Ajudamos empresas do segmento de ${lead.segment.toLowerCase()} a conquistarem novos clientes todos os dias com sites modernos e atendimento integrado ao WhatsApp. Posso te enviar uma demonstração sem compromisso de como ficaria a presença digital de vocês?`;

      return {
        leadId: lead.id,
        companyName: lead.companyName,
        username: lead.username,
        segment: lead.segment,
        city: lead.city,
        state: lead.state,
        whatsappNumber: cleanPhone || '5565981230256',
        pitchMessage: existingPitch || fallbackPitch,
        leadScore: lead.leadScore,
        websiteStatus: lead.websiteStatus,
      };
    });

    const response = NextResponse.json({
      success: true,
      count: queue.length,
      queue,
    });

    // Headers para evitar qualquer caching ou timeout de proxy
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', '*');

    return response;
  } catch (error: any) {
    console.error('Erro na rota dispatch-queue:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
          title: 'Abordagem automática enviada via WhatsApp (n8n)',
          description: `Disparo agendado executado com sucesso. Mensagem enviada: "${sentMessage ? sentMessage.substring(0, 150) + '...' : ''}"`,
          channel: 'WHATSAPP',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Lead atualizado para PRIMEIRO_CONTATO com sucesso.',
      });
    } else {
      await prisma.leadActivity.create({
        data: {
          leadId,
          type: 'NOTE',
          title: 'Tentativa de envio via n8n',
          description: `Status: ${status}. Erro: ${errorMessage || 'Falha no disparo'}`,
          channel: 'WHATSAPP',
        },
      });

      return NextResponse.json({ success: true, message: 'Status registrado' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
