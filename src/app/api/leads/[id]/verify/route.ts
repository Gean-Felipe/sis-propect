import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebsitePresence } from '@/lib/website-checker';
import { calculateLeadScore } from '@/lib/lead-scoring';

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

    // Executa verificação ativa e diagnóstico
    const result = await verifyWebsitePresence(lead.bioLink, lead.companyName, lead.bio);

    // Recalcular Lead Score com base no novo status
    const hasPhone = lead.contacts.some(c => c.type === 'PHONE');
    const hasWhatsApp = lead.contacts.some(c => c.type === 'WHATSAPP');
    const hasLocation = Boolean(lead.city || lead.state);
    const hasActiveInstagram = (lead.followersCount || 0) > 50 || (lead.postsCount || 0) > 5;

    const scoreResult = calculateLeadScore({
      websiteStatus: result.resultStatus,
      hasActiveInstagram,
      hasPhone,
      hasWhatsApp,
      hasLocation,
    });

    // Atualizar Lead no banco
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        websiteStatus: result.resultStatus,
        verifiedDomain: result.verifiedDomain,
        leadScore: scoreResult.totalScore,
        scoreTier: scoreResult.tier,
      },
    });

    // Registrar Verificação
    const checkRecord = await prisma.leadWebsiteCheck.create({
      data: {
        leadId: lead.id,
        rawUrl: result.rawUrl,
        targetUrl: result.targetUrl,
        isOwnDomain: result.isOwnDomain,
        isLinkTree: result.isLinkTree,
        isWhatsAppLink: result.isWhatsAppLink,
        isSocialLink: result.isSocialLink,
        httpStatus: result.httpStatus,
        sslValid: result.sslValid,
        responseTimeMs: result.responseTimeMs,
        resultStatus: result.resultStatus,
        evidence: result.evidence,
      },
    });

    // Atualizar Detalhamento do Score
    await prisma.leadScore.upsert({
      where: { leadId: lead.id },
      update: {
        totalScore: scoreResult.totalScore,
        noSiteScore: scoreResult.breakdown.noSiteScore,
        brokenSiteScore: scoreResult.breakdown.brokenSiteScore,
        activeInstagramScore: scoreResult.breakdown.activeInstagramScore,
        phoneScore: scoreResult.breakdown.phoneScore,
        whatsappScore: scoreResult.breakdown.whatsappScore,
        locationScore: scoreResult.breakdown.locationScore,
        calculatedAt: new Date(),
      },
      create: {
        leadId: lead.id,
        totalScore: scoreResult.totalScore,
        noSiteScore: scoreResult.breakdown.noSiteScore,
        brokenSiteScore: scoreResult.breakdown.brokenSiteScore,
        activeInstagramScore: scoreResult.breakdown.activeInstagramScore,
        phoneScore: scoreResult.breakdown.phoneScore,
        whatsappScore: scoreResult.breakdown.whatsappScore,
        locationScore: scoreResult.breakdown.locationScore,
      },
    });

    // Registrar Atividade na Timeline
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        title: 'Verificação ativa de presença digital executada',
        description: `Diagnóstico: ${result.resultStatus}. Nova pontuação calculada: ${scoreResult.totalScore} pts (${scoreResult.tier}).`,
      },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      checkRecord,
      scoreResult,
      result,
    });
  } catch (error: any) {
    console.error('Erro ao verificar website do lead:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar presença digital' },
      { status: 500 }
    );
  }
}
