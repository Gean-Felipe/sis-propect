import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebsitePresence } from '@/lib/website-checker';
import { calculateLeadScore } from '@/lib/lead-scoring';
import { detectSegment } from '@/lib/ai-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const websiteStatus = searchParams.get('websiteStatus');
    const segment = searchParams.get('segment');
    const pipelineStage = searchParams.get('pipelineStage');
    const scoreTier = searchParams.get('scoreTier');
    const sortBy = searchParams.get('sortBy') || 'leadScore';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { tradeName: { contains: search } },
        { username: { contains: search } },
        { bio: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
      ];
    }

    if (websiteStatus && websiteStatus !== 'ALL') {
      where.websiteStatus = websiteStatus;
    }

    if (segment && segment !== 'ALL') {
      where.segment = segment;
    }

    if (pipelineStage && pipelineStage !== 'ALL') {
      where.pipelineStage = pipelineStage;
    }

    if (scoreTier && scoreTier !== 'ALL') {
      where.scoreTier = scoreTier;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        contacts: true,
        scoreBreakdown: true,
        websiteChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('Erro ao listar leads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao buscar leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      tradeName,
      username,
      bio,
      bioLink,
      segment: customSegment,
      followersCount = 0,
      postsCount = 0,
      city,
      state,
      address,
      whatsapp,
      phone,
      email,
      notes,
    } = body;

    if (!companyName || !username) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa e @username do Instagram são obrigatórios.' },
        { status: 400 }
      );
    }

    // Normalizar @username
    const sanitizedUsername = username.replace(/^@/, '').trim().toLowerCase();

    // 1. Diagnóstico de Website
    const websiteDiag = await verifyWebsitePresence(bioLink, companyName, bio);

    // 2. Detecção de Segmento
    const segment = (customSegment && customSegment !== 'Não identificado')
      ? customSegment
      : detectSegment(companyName, bio);

    // 3. Cálculo de Lead Scoring (0 a 100)
    const hasPhone = Boolean(phone);
    const hasWhatsApp = Boolean(whatsapp);
    const hasLocation = Boolean(city || state);
    const hasActiveInstagram = Number(followersCount) > 50 || Number(postsCount) > 5;

    const scoreResult = calculateLeadScore({
      websiteStatus: websiteDiag.resultStatus,
      hasActiveInstagram,
      hasPhone,
      hasWhatsApp,
      hasLocation,
    });

    // 4. Salvar no Banco de Dados
    const lead = await prisma.lead.create({
      data: {
        companyName,
        tradeName: tradeName || companyName,
        username: sanitizedUsername,
        profileUrl: `https://instagram.com/${sanitizedUsername}`,
        bio,
        bioLink,
        segment,
        followersCount: Number(followersCount) || 0,
        postsCount: Number(postsCount) || 0,
        city,
        state,
        address,
        websiteStatus: websiteDiag.resultStatus,
        verifiedDomain: websiteDiag.verifiedDomain,
        leadScore: scoreResult.totalScore,
        scoreTier: scoreResult.tier,
        pipelineStage: 'NOVO_LEAD',
        notes,
      },
    });

    // Salvar contatos
    const contactsToCreate: any[] = [];
    if (whatsapp) {
      contactsToCreate.push({ leadId: lead.id, type: 'WHATSAPP', value: whatsapp, isPrimary: true });
    }
    if (phone) {
      contactsToCreate.push({ leadId: lead.id, type: 'PHONE', value: phone, isPrimary: !whatsapp });
    }
    if (email) {
      contactsToCreate.push({ leadId: lead.id, type: 'EMAIL', value: email, isPrimary: false });
    }

    if (contactsToCreate.length > 0) {
      await prisma.leadContact.createMany({ data: contactsToCreate });
    }

    // Salvar Registro de Verificação de Site
    await prisma.leadWebsiteCheck.create({
      data: {
        leadId: lead.id,
        rawUrl: websiteDiag.rawUrl,
        targetUrl: websiteDiag.targetUrl,
        isOwnDomain: websiteDiag.isOwnDomain,
        isLinkTree: websiteDiag.isLinkTree,
        isWhatsAppLink: websiteDiag.isWhatsAppLink,
        isSocialLink: websiteDiag.isSocialLink,
        httpStatus: websiteDiag.httpStatus,
        sslValid: websiteDiag.sslValid,
        responseTimeMs: websiteDiag.responseTimeMs,
        resultStatus: websiteDiag.resultStatus,
        evidence: websiteDiag.evidence,
      },
    });

    // Salvar Detalhamento do Score
    await prisma.leadScore.create({
      data: {
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
        title: 'Lead cadastrado no sistema',
        description: `Lead criado com pontuação ${scoreResult.totalScore} pts (${scoreResult.tier}). Diagnóstico: ${websiteDiag.resultStatus}.`,
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      scoreResult,
      websiteDiag,
    });
  } catch (error: any) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao salvar lead' },
      { status: 500 }
    );
  }
}
