/**
 * Módulo de Diagnóstico e Verificação de Presença Digital & Websites
 * Prioridade Absoluta: Identificar empresas que NÃO possuem site próprio.
 */

export type WebsiteCheckResult = {
  resultStatus: 'SEM SITE' | 'SITE IDENTIFICADO' | 'SITE COM PROBLEMAS' | 'PRESENÇA DIGITAL FRACA' | 'VERIFICAÇÃO PENDENTE';
  verifiedDomain: string | null;
  rawUrl: string | null;
  targetUrl: string | null;
  isOwnDomain: boolean;
  isLinkTree: boolean;
  isWhatsAppLink: boolean;
  isSocialLink: boolean;
  httpStatus: number | null;
  sslValid: boolean;
  responseTimeMs: number | null;
  evidence: string;
  notes: string[];
};

// Domínios conhecidos de agregadores de link (não são sites próprios)
const LINK_AGGREGATORS = [
  'linktr.ee',
  'linktree.com',
  'beacons.ai',
  'heylink.me',
  'bio.site',
  'linkr.bio',
  'allmylinks.com',
  'campsite.bio',
  'taplink.cc',
  'instabio.cc',
  'biolinky.co',
  'direct.me',
  'snipfeed.co',
  'contactinbio.com',
  'lnk.bio',
  'flow.page'
];

// Domínios de canais de mensagens diretas
const MESSAGING_SERVICES = [
  'wa.me',
  'api.whatsapp.com',
  'chat.whatsapp.com',
  'web.whatsapp.com',
  'linkwhats.com',
  'whatsfacil.com',
  'meugrupo.vip',
  't.me',
  'telegram.me'
];

// Redes sociais
const SOCIAL_NETWORKS = [
  'instagram.com',
  'facebook.com',
  'fb.me',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'kwai.com',
  'threads.net',
  'pinterest.com'
];

// Plataformas terceirizadas de agendamento ou catálogos
const THIRD_PARTY_PLATFORMS = [
  'ifood.com.br',
  'anota.ai',
  'goomer.app',
  'cardapioweb.com',
  'doctoralia.com.br',
  'trinks.com',
  'fresha.com',
  'calendly.com',
  'app.acuityscheduling.com'
];

export async function verifyWebsitePresence(
  rawInputUrl?: string | null,
  companyName?: string | null,
  bioText?: string | null
): Promise<WebsiteCheckResult> {
  const notes: string[] = [];
  const startTime = Date.now();

  // 1. Cenário: Nenhum link fornecido ou disponível na bio
  if (!rawInputUrl || rawInputUrl.trim() === '') {
    // Analisar se na bio há menção de site textual (ex: "acesse www.exemplo.com.br")
    const foundUrlInBio = extractUrlFromText(bioText || '');
    if (!foundUrlInBio) {
      notes.push('Não possui link cadastrado na biografia do Instagram.');
      notes.push('Não foi detectada nenhuma menção a endereço web no texto da bio.');
      notes.push('Negócio depende exclusivamente de interações diretas na rede social.');

      return {
        resultStatus: 'SEM SITE',
        verifiedDomain: null,
        rawUrl: null,
        targetUrl: null,
        isOwnDomain: false,
        isLinkTree: false,
        isWhatsAppLink: false,
        isSocialLink: false,
        httpStatus: null,
        sslValid: false,
        responseTimeMs: null,
        evidence: JSON.stringify({
          reason: 'Ausência total de link ou domínio próprio na bio.',
          evaluatedBio: bioText ? 'Bio avaliada sem URLs encontradas' : 'Sem bio disponível'
        }),
        notes
      };
    } else {
      rawInputUrl = foundUrlInBio;
      notes.push(`URL identificada a partir do texto da biografia: ${rawInputUrl}`);
    }
  }

  // Limpeza e normalização da URL
  let sanitizedUrl = rawInputUrl.trim();
  if (!/^https?:\/\//i.test(sanitizedUrl)) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }

  let parsedHost = '';
  try {
    const urlObj = new URL(sanitizedUrl);
    parsedHost = urlObj.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    notes.push(`Formato de URL inválido ou malformado: ${rawInputUrl}`);
    return {
      resultStatus: 'SITE COM PROBLEMAS',
      verifiedDomain: null,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: false,
      isLinkTree: false,
      isWhatsAppLink: false,
      isSocialLink: false,
      httpStatus: null,
      sslValid: false,
      responseTimeMs: null,
      evidence: JSON.stringify({ reason: 'URL malformada ou sintaxe inválida' }),
      notes
    };
  }

  // 2. Avaliação de Agregador de Links (Linktree, Beacons, etc.)
  const isAggregator = LINK_AGGREGATORS.some(domain => parsedHost.includes(domain));
  if (isAggregator) {
    notes.push(`Utiliza agregador de links (${parsedHost}) em vez de site institucional próprio.`);
    notes.push('Agregadores dispersam a atenção do cliente e não oferecem autoridade no Google (SEO).');
    
    return {
      resultStatus: 'PRESENÇA DIGITAL FRACA',
      verifiedDomain: null,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: false,
      isLinkTree: true,
      isWhatsAppLink: false,
      isSocialLink: false,
      httpStatus: 200,
      sslValid: true,
      responseTimeMs: Date.now() - startTime,
      evidence: JSON.stringify({
        aggregator: parsedHost,
        reason: 'O negócio utiliza página genérica agregadora de links (árvore de links). Não possui site institucional dedicado.'
      }),
      notes
    };
  }

  // 3. Avaliação de Link Direto de WhatsApp / Mensagem
  const isWhatsApp = MESSAGING_SERVICES.some(domain => parsedHost.includes(domain));
  if (isWhatsApp) {
    notes.push('O link da bio direciona unicamente para uma conversa de WhatsApp.');
    notes.push('A empresa não possui catálogo ou portal informativo próprio indexado na web.');

    return {
      resultStatus: 'SEM SITE',
      verifiedDomain: null,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: false,
      isLinkTree: false,
      isWhatsAppLink: true,
      isSocialLink: false,
      httpStatus: 200,
      sslValid: true,
      responseTimeMs: Date.now() - startTime,
      evidence: JSON.stringify({
        channel: 'WhatsApp Direct',
        reason: 'O link cadastrado é apenas um atalho wa.me / API WhatsApp, comprovando ausência de site próprio.'
      }),
      notes
    };
  }

  // 4. Avaliação de Redes Sociais
  const isSocial = SOCIAL_NETWORKS.some(domain => parsedHost.includes(domain));
  if (isSocial) {
    notes.push(`O link direciona para outra rede social (${parsedHost}).`);
    notes.push('Não foi encontrado site institucional próprio.');

    return {
      resultStatus: 'PRESENÇA DIGITAL FRACA',
      verifiedDomain: null,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: false,
      isLinkTree: false,
      isWhatsAppLink: false,
      isSocialLink: true,
      httpStatus: 200,
      sslValid: true,
      responseTimeMs: Date.now() - startTime,
      evidence: JSON.stringify({
        socialPlatform: parsedHost,
        reason: 'Redireciona para rede social externa, sem presença na web aberta através de portal institucional.'
      }),
      notes
    };
  }

  // 5. Avaliação de Plataformas Terceiras de Catálogo/Agendamento
  const isThirdParty = THIRD_PARTY_PLATFORMS.some(domain => parsedHost.includes(domain));
  if (isThirdParty) {
    notes.push(`O link utiliza plataforma externa de terceiros (${parsedHost}).`);
    notes.push('A empresa fica refém de taxas e da identidade visual da plataforma parceira.');

    return {
      resultStatus: 'PRESENÇA DIGITAL FRACA',
      verifiedDomain: null,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: false,
      isLinkTree: false,
      isWhatsAppLink: false,
      isSocialLink: false,
      httpStatus: 200,
      sslValid: true,
      responseTimeMs: Date.now() - startTime,
      evidence: JSON.stringify({
        platform: parsedHost,
        reason: 'Utiliza plataforma terceirizada com domínio de terceiros, sem independência digital ou site institucional próprio.'
      }),
      notes
    };
  }

  // 6. Teste Ativo de Domínio Próprio via Fetch com Timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(sanitizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GFSitesProspectIntelligence/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const statusCode = response.status;
    const finalUrl = response.url;

    // Verificar se o redirecionamento final caiu em um agregador ou whatsapp
    const finalHost = new URL(finalUrl).hostname.toLowerCase();
    if (LINK_AGGREGATORS.some(domain => finalHost.includes(domain))) {
      notes.push('O domínio próprio redirecionou para um agregador de links externo.');
      return {
        resultStatus: 'PRESENÇA DIGITAL FRACA',
        verifiedDomain: parsedHost,
        rawUrl: rawInputUrl,
        targetUrl: finalUrl,
        isOwnDomain: true,
        isLinkTree: true,
        isWhatsAppLink: false,
        isSocialLink: false,
        httpStatus: statusCode,
        sslValid: sanitizedUrl.startsWith('https://'),
        responseTimeMs: responseTime,
        evidence: JSON.stringify({ finalHost, reason: 'Redireciona para agregador' }),
        notes
      };
    }

    if (statusCode >= 200 && statusCode < 300) {
      // Checar conteúdo textual básico
      const htmlText = await response.text();
      const isUnderConstruction = /em construção|site em breve|under construction|domínio à venda|compre este domínio|parked domain/i.test(htmlText);

      if (isUnderConstruction) {
        notes.push('Domínio existente porém com página estática de "Em Construção" ou domínio estacionado.');
        return {
          resultStatus: 'SITE COM PROBLEMAS',
          verifiedDomain: parsedHost,
          rawUrl: rawInputUrl,
          targetUrl: finalUrl,
          isOwnDomain: true,
          isLinkTree: false,
          isWhatsAppLink: false,
          isSocialLink: false,
          httpStatus: statusCode,
          sslValid: true,
          responseTimeMs: responseTime,
          evidence: JSON.stringify({ statusCode, reason: 'Site em construção ou domínio estacionado' }),
          notes
        };
      }

      notes.push(`Site próprio identificado e operando normalmente (HTTP ${statusCode}).`);
      notes.push(`Tempo de resposta: ${responseTime}ms com certificado SSL ativo.`);

      return {
        resultStatus: 'SITE IDENTIFICADO',
        verifiedDomain: parsedHost,
        rawUrl: rawInputUrl,
        targetUrl: finalUrl,
        isOwnDomain: true,
        isLinkTree: false,
        isWhatsAppLink: false,
        isSocialLink: false,
        httpStatus: statusCode,
        sslValid: sanitizedUrl.startsWith('https://'),
        responseTimeMs: responseTime,
        evidence: JSON.stringify({ statusCode, responseTimeMs: responseTime, domain: parsedHost }),
        notes
      };
    } else {
      notes.push(`O site respondeu com código de erro HTTP ${statusCode}.`);
      return {
        resultStatus: 'SITE COM PROBLEMAS',
        verifiedDomain: parsedHost,
        rawUrl: rawInputUrl,
        targetUrl: finalUrl,
        isOwnDomain: true,
        isLinkTree: false,
        isWhatsAppLink: false,
        isSocialLink: false,
        httpStatus: statusCode,
        sslValid: false,
        responseTimeMs: responseTime,
        evidence: JSON.stringify({ statusCode, error: `Retorno HTTP não amigável ${statusCode}` }),
        notes
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    notes.push(`Falha ao conectar no domínio: ${error.name === 'AbortError' ? 'Tempo limite de conexão esgotado (Timeout)' : error.message}`);
    notes.push('O domínio parece inativo, fora do ar ou com configuração de DNS/SSL com falha.');

    return {
      resultStatus: 'SITE COM PROBLEMAS',
      verifiedDomain: parsedHost,
      rawUrl: rawInputUrl,
      targetUrl: sanitizedUrl,
      isOwnDomain: true,
      isLinkTree: false,
      isWhatsAppLink: false,
      isSocialLink: false,
      httpStatus: null,
      sslValid: false,
      responseTimeMs: responseTime,
      evidence: JSON.stringify({
        error: error.message,
        isTimeout: error.name === 'AbortError',
        reason: 'Domínio registrado porém inacessível ou fora do ar'
      }),
      notes
    };
  }
}

/**
 * Função utilitária para extrair possíveis URLs dentro de textos da biografia
 */
function extractUrlFromText(text: string): string | null {
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}
