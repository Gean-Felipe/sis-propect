/**
 * Motor de Inteligência Artificial para Diagnóstico e Prospecção Comercial
 * GFSites Prospect Intelligence
 */

export type AiAnalysisOutput = {
  identifiedSegment: string;
  digitalDiagnosis: string;
  commercialPain: string;
  suggestedServices: {
    name: string;
    category: 'WEBSITES' | 'AUTOMATION' | 'AI_AGENTS';
    reason: string;
  }[];
  personalizedPitch: string;
  alternativePitch: string;
  salesArguments: string[];
  recommendedNextStep: string;
  urgencyLevel: 'ALTA' | 'MÉDIA' | 'NORMAL';
};

export type LeadAiContext = {
  companyName: string;
  username: string;
  bio?: string | null;
  bioLink?: string | null;
  segment?: string | null;
  websiteStatus: string;
  followersCount?: number | null;
  city?: string | null;
  state?: string | null;
  whatsapp?: string | null;
};

// Segmentos suportados e palavras-chave para detecção heurística precisa
const SEGMENT_KEYWORDS: Record<string, string[]> = {
  'Clínica odontológica': ['odonto', 'dentista', 'implante', 'ortodontia', 'sorriso', 'clareamento', 'protese dental', 'harmonizacao orofacial'],
  'Clínica médica': ['medicina', 'médic', 'doutor', 'consulta', 'cardiologia', 'dermatologia', 'pediatria', 'ginecologia', 'cirurgia'],
  'Psicologia': ['psicolog', 'terapia', 'psicoterapia', 'saude mental', 'ansiedade', 'terapeuta'],
  'Oftalmologia': ['oftalmo', 'olhos', 'visao', 'oculos', 'lentes de contato', 'retina'],
  'Barbearia': ['barbearia', 'barbeiro', 'corte masculino', 'barba', 'fade', 'barber'],
  'Salão de beleza': ['salao de beleza', 'cabelereir', 'cabelos', 'mechas', 'loira', 'penteado', 'manicure'],
  'Estética e Bem-estar': ['estetica', 'botox', 'preenchimento', 'drenagem', 'limpeza de pele', 'emagrecimento', 'depilacao a laser'],
  'Academia e Fitness': ['academia', 'fitness', 'treino', 'musculacao', 'crossfit', 'personal trainer'],
  'Restaurante e Gastronomia': ['restaurante', 'gastronomia', 'cardapio', 'culinaria', 'bistro', 'almoco', 'jantar', 'pizzaria', 'hamburgueria'],
  'Cafeteria e Confeitaria': ['cafe', 'cafeteria', 'confeitaria', 'bolos', 'doces', 'tortas', 'espresso'],
  'Petshop e Veterinária': ['pet', 'veterinari', 'banho e tosa', 'racoes', 'clinica veterinaria', 'animais'],
  'Imobiliária e Corretores': ['imobiliaria', 'imoveis', 'corretor', 'apartamento', 'locacao', 'venda de imoveis'],
  'Escritório de advocacia': ['advocacia', 'advogad', 'direito', 'juridico', 'oab', 'previdenciario', 'trabalhista', 'civil'],
};

/**
 * Detecta o segmento de atuação baseado no nome da empresa e texto da biografia
 */
export function detectSegment(companyName: string, bio?: string | null): string {
  const fullText = `${companyName} ${bio || ''}`.toLowerCase();
  
  for (const [segment, keywords] of Object.entries(SEGMENT_KEYWORDS)) {
    if (keywords.some(kw => fullText.includes(kw))) {
      return segment;
    }
  }

  return 'Comércio e Serviços';
}

/**
 * Executa a análise completa de Inteligência Artificial para o Lead
 */
export async function analyzeLeadWithAi(context: LeadAiContext): Promise<AiAnalysisOutput> {
  const segment = (context.segment && context.segment !== 'Não identificado')
    ? context.segment
    : detectSegment(context.companyName, context.bio);

  const cityState = [context.city, context.state].filter(Boolean).join(' - ');
  const locationText = cityState ? ` em ${cityState}` : '';

  // Diagnóstico baseado no status de presença de site
  let diagnosisText = '';
  let commercialPain = '';
  let pitch = '';
  let altPitch = '';
  const suggestedServices: AiAnalysisOutput['suggestedServices'] = [];
  const salesArguments: string[] = [];
  let urgencyLevel: AiAnalysisOutput['urgencyLevel'] = 'NORMAL';

  if (context.websiteStatus === 'SEM SITE') {
    urgencyLevel = 'ALTA';
    diagnosisText = `A empresa ${context.companyName} apresenta atividade no Instagram, porém não possui site próprio institucional. Toda a sua comunicação e conversão de novos clientes depende exclusivamente de cliques diretos na rede social ou busca em diretórios. Não é encontrada nos resultados orgânicos do Google para pesquisas de ${segment.toLowerCase()}${locationText}.`;
    
    commercialPain = `Perda de potenciais clientes qualificados que buscam serviços de ${segment.toLowerCase()} no Google e optam por concorrentes com site profissional estruturado. Falta de credibilidade perante clientes mais exigentes.`;

    suggestedServices.push(
      {
        name: `Site Institucional Profissional para ${segment}`,
        category: 'WEBSITES',
        reason: 'Posiciona a empresa no Google, apresenta todos os serviços, equipe e diferencial com autoridade imediata.'
      },
      {
        name: 'Automação Comercial de Atendimento WhatsApp',
        category: 'AUTOMATION',
        reason: 'Direciona os visitantes do novo site e do Instagram para triagem e agendamento instantâneo 24/7.'
      }
    );

    salesArguments.push(
      `Quem procura por ${segment.toLowerCase()} no Google tem urgência e maior poder de compra do que quem está apenas rolando o feed do Instagram.`,
      `Um site profissional com botão de agendamento reduz o tempo de resposta e passa muito mais confiança ao paciente/cliente.`,
      `A GFSites entrega o site pronto, rápido, otimizado para celular e integrado diretamente ao seu WhatsApp de atendimento.`
    );

    pitch = `Olá! Tudo bem? Me chamo Gean, sou responsável pela GFSites & Automações. Conheci o trabalho da ${context.companyName} pelo Instagram e gostei bastante da atuação de vocês${locationText}. Notei que vocês ainda não possuem um site profissional próprio para apresentar seus serviços no Google. Ajudamos ${segment.toLowerCase()}s a conquistarem novos clientes todos os dias com sites rápidos e de alta credibilidade. Posso te enviar uma demonstração sem compromisso de como ficaria a presença digital de vocês?`;

    altPitch = `Olá, equipe da ${context.companyName}! Parabéns pelo conteúdo aqui no Instagram. Estava pesquisando negócios de destaque em ${segment.toLowerCase()} e percebi uma grande oportunidade: vocês têm muito potencial para liderar as buscas do Google se tiverem um site institucional exclusivo. Na GFSites desenvolvemos páginas focadas em conversão e automação de contatos. Teria 3 minutos essa semana para conversarmos?`;

  } else if (context.websiteStatus === 'SITE COM PROBLEMAS') {
    urgencyLevel = 'ALTA';
    diagnosisText = `A empresa possui um domínio registrado, mas o link atual apresenta instabilidade, lentidão excessiva, erro técnico ou não está responsivo para smartphones. Isso transmite sensação de abandono ao cliente que tenta acessá-lo.`;

    commercialPain = `Desperdício de tráfego e queima de credibilidade da marca: clientes tentam acessar o site e encontram tela de erro ou página travada.`;

    suggestedServices.push(
      {
        name: 'Redesign e Modernização de Site de Alta Performance',
        category: 'WEBSITES',
        reason: 'Recuperar o tráfego perdido e transformar o site em uma máquina de captação confiável e segura.'
      },
      {
        name: 'Agendamento Inteligente & Atendimento IA',
        category: 'AI_AGENTS',
        reason: 'Evitar que contatos se percam e acelerar a triagem de mensagens.'
      }
    );

    salesArguments.push(
      'Mais de 70% dos acessos a sites de negócios locais são feitos pelo celular; um site com falhas afasta o cliente imediatamente.',
      'Sites modernos desenvolvidos pela GFSites contam com carregamento ultrarrápido, certificado SSL e hospedagem profissional.'
    );

    pitch = `Olá! Tudo bem? Me chamo Gean, da GFSites & Automações. Tentei acessar o site da ${context.companyName} através do link indicado e notei que a página está apresentando uma falha de conexão no momento. Como trabalhamos com infraestrutura e desenvolvimento web de alta performance, gostaria de alertar vocês para não perderem vendas. Se quiserem, posso ajudar a restabelecer e modernizar a página de vocês.`;

    altPitch = `Olá! Aqui é o Gean da GFSites. Estava conhecendo a ${context.companyName} e percebi que o link do site de vocês está com instabilidade técnica. Temos soluções especializadas de reformulação e hospedagem para empresas que precisam de 100% de estabilidade. Posso te apresentar nossa proposta de modernização?`;

  } else if (context.websiteStatus === 'PRESENÇA DIGITAL FRACA') {
    urgencyLevel = 'MÉDIA';
    diagnosisText = `A empresa utiliza uma árvore de links genérica (agregador) ou redireciona unicamente para plataformas de terceiros. Falta autoridade de marca própria e SEO.`;

    commercialPain = `Dispersão de leads em múltiplos botões concorrentes dentro do agregador de links, sem captar dados ou gerar autoridade própria.`;

    suggestedServices.push(
      {
        name: 'Landing Page de Alta Conversão com Domínio Próprio',
        category: 'WEBSITES',
        reason: 'Substitui o Linktree por uma página exclusiva da própria marca, aumentando a taxa de conversão em até 3x.'
      },
      {
        name: 'Atendimento Automatizado via WhatsApp',
        category: 'AUTOMATION',
        reason: 'Qualificação prévia do cliente antes de enviar para o atendente humano.'
      }
    );

    salesArguments.push(
      'Um domínio próprio (ex: suaempresa.com.br) passa 5 vezes mais segurança do que um link genérico de agregador.',
      'Com um site próprio, é possível rastrear visitantes com Pixel e Google Analytics para remarketing.'
    );

    pitch = `Olá! Tudo bem? Me chamo Gean, responsável pela GFSites & Automações. Acompanho o perfil da ${context.companyName} e vejo que vocês já têm uma demanda constante de contatos. Percebi que vocês usam uma página de links genérica na bio. Na GFSites nós criamos portais institucionais e páginas de alta conversão sob medida para substituir esses links simples por uma experiência profissional que valoriza a marca de vocês. Posso te mostrar um exemplo aplicado ao seu nicho?`;

    altPitch = `Olá! Parabéns pelo perfil e posicionamento da ${context.companyName}. Notei que a bio de vocês usa agregador de links. Sabia que ter uma landing page própria com o nome do seu negócio aumenta muito a percepção de valor dos seus serviços? Nós da GFSites desenvolvemos páginas completas integradas ao WhatsApp. Teria disponibilidade para ver uma prévia?`;

  } else {
    urgencyLevel = 'NORMAL';
    diagnosisText = `A empresa já possui um site institucional ativo e funcional. A principal oportunidade está em complementar a estrutura com automações de vendas, atendimento com IA e CRM.`;

    commercialPain = `Demora no atendimento a novos leads vindos do site e do Instagram, dependência de atendimento manual em horário comercial.`;

    suggestedServices.push(
      {
        name: 'Agente de Inteligência Artificial para Atendimento WhatsApp 24/7',
        category: 'AI_AGENTS',
        reason: 'Atendimento instantâneo, tira-dúvidas e qualificação mesmo fora do horário comercial.'
      },
      {
        name: 'Automação de Follow-up e Integração CRM',
        category: 'AUTOMATION',
        reason: 'Garantir que nenhum contato fique sem resposta ou sem proposta enviada.'
      }
    );

    salesArguments.push(
      'Mesmo empresas com bons sites perdem até 40% das oportunidades se o atendimento no WhatsApp demorar mais de 5 minutos.',
      'A IA da GFSites responde dúvidas técnicas, agenda visitas/consultas e encaminha o lead pronto para o fechamento.'
    );

    pitch = `Olá! Tudo bem? Sou o Gean da GFSites & Automações. Estive no site da ${context.companyName} e gostei muito da estrutura de vocês! Nós desenvolvemos assistentes inteligentes e automações para WhatsApp que atendem e qualificam os clientes do seu site instantaneamente, 24 horas por dia. Se fizer sentido, posso mostrar como isso tem gerado mais agendamentos para negócios como o seu.`;

    altPitch = `Olá, equipe da ${context.companyName}! Parabéns pelo site e pela presença digital sólida de vocês. Gostaria de apresentar uma inovação que temos implementado em empresas do seu segmento: automação com Inteligência Artificial para responder pacientes/clientes no WhatsApp sem fila de espera. Posso compartilhar um rápido vídeo de demonstração?`;
  }

  const recommendedNextStep = context.whatsapp
    ? `Enviar abordagem via WhatsApp para o número cadastrado com o script humanizado.`
    : `Enviar mensagem direta (Direct) no Instagram convidando para apresentação sem compromisso.`;

  return {
    identifiedSegment: segment,
    digitalDiagnosis: diagnosisText,
    commercialPain,
    suggestedServices,
    personalizedPitch: pitch,
    alternativePitch: altPitch,
    salesArguments,
    recommendedNextStep,
    urgencyLevel,
  };
}
