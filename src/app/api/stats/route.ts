import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        contacts: true,
      },
    });

    const totalLeads = leads.length;
    const leadsWithoutSite = leads.filter(l => l.websiteStatus === 'SEM SITE').length;
    const leadsBrokenSite = leads.filter(l => l.websiteStatus === 'SITE COM PROBLEMAS').length;
    const leadsWeakPresence = leads.filter(l => l.websiteStatus === 'PRESENÇA DIGITAL FRACA').length;
    const leadsWithSite = leads.filter(l => l.websiteStatus === 'SITE IDENTIFICADO').length;

    const priorityLeads = leads.filter(l => l.leadScore >= 80).length;
    const highPotentialLeads = leads.filter(l => l.leadScore >= 60 && l.leadScore < 80).length;

    // Etapas do Funil
    const leadsContacted = leads.filter(l => 
      ['PRIMEIRO_CONTATO', 'INTERESSADO', 'REUNIAO_AGENDADA', 'PROPOSTA_ENVIADA', 'EM_NEGOCIACAO', 'FECHADO_GANHO'].includes(l.pipelineStage)
    ).length;

    const leadsInterested = leads.filter(l => 
      ['INTERESSADO', 'REUNIAO_AGENDADA', 'PROPOSTA_ENVIADA', 'EM_NEGOCIACAO', 'FECHADO_GANHO'].includes(l.pipelineStage)
    ).length;

    const proposalsSent = leads.filter(l => 
      ['PROPOSTA_ENVIADA', 'EM_NEGOCIACAO', 'FECHADO_GANHO'].includes(l.pipelineStage)
    ).length;

    const dealsWon = leads.filter(l => l.pipelineStage === 'FECHADO_GANHO').length;
    const dealsLost = leads.filter(l => l.pipelineStage === 'FECHADO_PERDIDO').length;

    // Métricas Financeiras
    const totalPotentialRevenue = leads.reduce((acc, curr) => acc + (curr.dealValue || 1800), 0);
    const closedRevenue = leads
      .filter(l => l.pipelineStage === 'FECHADO_GANHO')
      .reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

    const conversionRate = leadsContacted > 0 
      ? Number(((dealsWon / leadsContacted) * 100).toFixed(1)) 
      : 0;

    // 10 Oportunidades de Ouro (Empresas SEM SITE com maior pontuação)
    const goldenOpportunities = await prisma.lead.findMany({
      where: {
        websiteStatus: 'SEM SITE',
      },
      orderBy: {
        leadScore: 'desc',
      },
      take: 10,
      include: {
        contacts: true,
      },
    });

    // Agrupamento por Segmento
    const segmentCounts: Record<string, number> = {};
    leads.forEach(l => {
      const seg = l.segment || 'Outros';
      segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
    });

    // Agrupamento por Estágio do Funil
    const stageCounts: Record<string, number> = {};
    leads.forEach(l => {
      stageCounts[l.pipelineStage] = (stageCounts[l.pipelineStage] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalLeads,
        leadsWithoutSite,
        leadsBrokenSite,
        leadsWeakPresence,
        leadsWithSite,
        priorityLeads,
        highPotentialLeads,
        leadsContacted,
        leadsInterested,
        proposalsSent,
        dealsWon,
        dealsLost,
        conversionRate,
        totalPotentialRevenue,
        closedRevenue,
      },
      goldenOpportunities,
      charts: {
        bySegment: segmentCounts,
        byStage: stageCounts,
        byWebsiteStatus: {
          'Sem Site': leadsWithoutSite,
          'Site com Problemas': leadsBrokenSite,
          'Presença Fraca (Linktree)': leadsWeakPresence,
          'Site Identificado': leadsWithSite,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao calcular estatísticas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar métricas' },
      { status: 500 }
    );
  }
}
