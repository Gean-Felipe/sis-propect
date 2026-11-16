/**
 * Motor de Lead Scoring Comercial da GFSites Prospect Intelligence
 * Pontuação de 0 a 100 priorizando empresas sem site institucional.
 */

export type LeadScoreInput = {
  websiteStatus: 'SEM SITE' | 'SITE IDENTIFICADO' | 'SITE COM PROBLEMAS' | 'PRESENÇA DIGITAL FRACA' | 'VERIFICAÇÃO PENDENTE' | string;
  hasActiveInstagram: boolean;
  hasPhone: boolean;
  hasWhatsApp: boolean;
  hasLocation: boolean;
  customWeights?: Partial<ScoreWeights>;
};

export type ScoreWeights = {
  noSite: number;        // Padrão: 35
  brokenSite: number;    // Padrão: 25
  weakPresence: number;  // Padrão: 20
  activeInstagram: number; // Padrão: 15
  phone: number;         // Padrão: 10
  whatsapp: number;      // Padrão: 10
  location: number;      // Padrão: 5
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  noSite: 35,
  brokenSite: 25,
  weakPresence: 20,
  activeInstagram: 15,
  phone: 10,
  whatsapp: 10,
  location: 5,
};

export type CalculatedScore = {
  totalScore: number; // Limitado a 100
  tier: 'OPORTUNIDADE PRIORITÁRIA' | 'ALTO POTENCIAL' | 'POTENCIAL MODERADO' | 'BAIXA PRIORIDADE';
  breakdown: {
    noSiteScore: number;
    brokenSiteScore: number;
    activeInstagramScore: number;
    phoneScore: number;
    whatsappScore: number;
    locationScore: number;
  };
  reasons: string[];
};

export function calculateLeadScore(input: LeadScoreInput): CalculatedScore {
  const weights = { ...DEFAULT_WEIGHTS, ...(input.customWeights || {}) };
  const reasons: string[] = [];
  
  let noSiteScore = 0;
  let brokenSiteScore = 0;
  let activeInstagramScore = 0;
  let phoneScore = 0;
  let whatsappScore = 0;
  let locationScore = 0;

  // 1. Critério Principal: Presença de Website
  if (input.websiteStatus === 'SEM SITE') {
    noSiteScore = weights.noSite;
    reasons.push(`+${noSiteScore} pts: Empresa não possui site próprio identificado (Principal Oportunidade)`);
  } else if (input.websiteStatus === 'SITE COM PROBLEMAS') {
    brokenSiteScore = weights.brokenSite;
    reasons.push(`+${brokenSiteScore} pts: Site existente com erros técnicos, fora do ar ou desatualizado`);
  } else if (input.websiteStatus === 'PRESENÇA DIGITAL FRACA') {
    noSiteScore = weights.weakPresence;
    reasons.push(`+${noSiteScore} pts: Presença digital fraca ou dependente exclusivamente de links genéricos`);
  }

  // 2. Instagram Comercial Ativo
  if (input.hasActiveInstagram) {
    activeInstagramScore = weights.activeInstagram;
    reasons.push(`+${activeInstagramScore} pts: Perfil comercial ativo e movimentado no Instagram`);
  }

  // 3. Telefone Comercial Público
  if (input.hasPhone) {
    phoneScore = weights.phone;
    reasons.push(`+${phoneScore} pts: Telefone comercial público disponível`);
  }

  // 4. WhatsApp Comercial Público
  if (input.hasWhatsApp) {
    whatsappScore = weights.whatsapp;
    reasons.push(`+${whatsappScore} pts: Canal direto de WhatsApp disponível para abordagem`);
  }

  // 5. Localização Identificada
  if (input.hasLocation) {
    locationScore = weights.location;
    reasons.push(`+${locationScore} pts: Cidade/Estado identificados para personalização regional`);
  }

  const rawSum = noSiteScore + brokenSiteScore + activeInstagramScore + phoneScore + whatsappScore + locationScore;
  const totalScore = Math.min(100, Math.max(0, rawSum));

  let tier: CalculatedScore['tier'] = 'BAIXA PRIORIDADE';
  if (totalScore >= 80) {
    tier = 'OPORTUNIDADE PRIORITÁRIA';
  } else if (totalScore >= 60) {
    tier = 'ALTO POTENCIAL';
  } else if (totalScore >= 40) {
    tier = 'POTENCIAL MODERADO';
  }

  return {
    totalScore,
    tier,
    breakdown: {
      noSiteScore,
      brokenSiteScore,
      activeInstagramScore,
      phoneScore,
      whatsappScore,
      locationScore,
    },
    reasons,
  };
}
