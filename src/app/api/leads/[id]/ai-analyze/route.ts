import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { analyzeLeadWithAi } from '@/lib/ai-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { contacts: true },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    const whatsappContact = lead.contacts.find(c => c.type === 'WHATSAPP');

    // Executar análise com o motor de IA
    const aiAnalysis = await analyzeLeadWithAi({
      companyName: lead.companyName,
      username: lead.username,
      bio: lead.bio,
      bioLink: lead.bioLink,
      segment: lead.segment,
      websiteStatus: lead.websiteStatus,
      followersCount: lead.followersCount,
      city: lead.city,
      state: lead.state,
      whatsapp: whatsappContact?.value,
    });

    // Se o segmento foi identificado/refinado, atualizar no lead
    if (aiAnalysis.identifiedSegment && lead.segment === 'Não identificado') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { segment: aiAnalysis.identifiedSegment },
      });
    }

    // Salvar análise de IA no banco
    const savedAnalysis = await prisma.aiAnalysis.create({
      data: {
        leadId: lead.id,
        identifiedSegment: aiAnalysis.identifiedSegment,
        digitalDiagnosis: aiAnalysis.digitalDiagnosis,
        commercialPain: aiAnalysis.commercialPain,
        suggestedServices: JSON.stringify(aiAnalysis.suggestedServices),
        personalizedPitch: aiAnalysis.personalizedPitch,
        recommendedNextStep: aiAnalysis.recommendedNextStep,
      },
    });

    // Registrar na timeline de atividades
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'AI_ANALYSIS',
        title: 'Inteligência Artificial gerou diagnóstico comercial e abordagem personalizada',
        description: `Segmento: ${aiAnalysis.identifiedSegment}. Urgência: ${aiAnalysis.urgencyLevel}. Script humanizado preparado para envio.`,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      savedId: savedAnalysis.id,
    });
  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar análise com IA' },
      { status: 500 }
    );
  }
}
