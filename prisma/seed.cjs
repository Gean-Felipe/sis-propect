const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do GFSites Prospect Intelligence ---');

  // 1. Criar Usuário Administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'contato@gfsites.com.br' },
    update: {},
    create: {
      name: 'Gean Felipe',
      email: 'contato@gfsites.com.br',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });
  console.log(`Usuário Admin configurado: ${adminUser.name}`);

  // 2. Criar Catálogo de Serviços da GFSites & Automações
  const services = [
    {
      category: 'WEBSITES',
      name: 'Site Institucional Profissional',
      description: 'Desenvolvimento de site completo, veloz, responsivo e com alta autoridade de marca para posicionar a empresa no Google.',
      benefits: 'Design exclusivo, SEO estruturado, páginas de serviços, integração com WhatsApp, certificado SSL e alta velocidade no celular.',
      startingPrice: 1800.0,
      estimatedDays: 10,
      targetAudience: 'Clínicas, consultórios, escritórios de advocacia, imobiliárias e empresas de serviços.',
      salesArguments: 'Ter um site próprio no nome da sua empresa gera 5x mais confiança e atrai clientes que buscam ativamente no Google prontos para comprar.',
    },
    {
      category: 'WEBSITES',
      name: 'Landing Page de Alta Conversão',
      description: 'Página única focada em converter visitantes do tráfego pago ou do Instagram em clientes direto no WhatsApp.',
      benefits: 'Copywriting persuasivo, carregamento instantâneo, botões de ação estratégicos, rastreamento de conversão com Pixel.',
      startingPrice: 950.0,
      estimatedDays: 5,
      targetAudience: 'Profissionais autônomos, lançamentos de serviços, procedimentos estéticos e odontológicos específicos.',
      salesArguments: 'Substitui o Linktree por uma página da sua própria marca que dobra as mensagens recebidas.',
    },
    {
      category: 'WEBSITES',
      name: 'Site Exclusivo para Clínicas & Saúde',
      description: 'Portal completo para clínicas médicas e odontológicas com apresentação de especialidades, corpo clínico e agendamento.',
      benefits: 'Em conformidade com regras dos conselhos (CFM/CFO), mapas de localização e botão de marcação de consulta rápida.',
      startingPrice: 2400.0,
      estimatedDays: 14,
      targetAudience: 'Clínicas odontológicas, policlínicas, oftalmologia, psicologia e centros de diagnóstico.',
      salesArguments: 'Pacientes de saúde valorizam credibilidade acima de tudo. Um site amador ou inexistente faz o paciente escolher outra clínica.',
    },
    {
      category: 'AUTOMATION',
      name: 'Atendimento Automatizado via WhatsApp',
      description: 'Fluxo inteligente para recepcionar, filtrar demandas e direcionar clientes no WhatsApp sem tempo de espera.',
      benefits: 'Atendimento instantâneo 24/7, cardápio de opções intuitivo, triagem por especialidade, redução de sobrecarga da secretária.',
      startingPrice: 850.0,
      estimatedDays: 4,
      targetAudience: 'Empresas com alto volume de mensagens no WhatsApp e redes sociais.',
      salesArguments: 'Responder um lead em menos de 1 minuto aumenta as chances de fechamento em até 391%. Não deixe seu cliente esperando.',
    },
    {
      category: 'AUTOMATION',
      name: 'Agendamento & Confirmação Automática de Consultas',
      description: 'Sistema integrado que envia lembretes automáticos no WhatsApp e permite confirmar ou reagendar horários.',
      benefits: 'Reduz o "no-show" (faltas) em até 80%, preenche horários vagos automaticamente e sincroniza com Google Agenda.',
      startingPrice: 1200.0,
      estimatedDays: 7,
      targetAudience: 'Clínicas médicas, dentistas, barbearias, salões de beleza e estúdios de estética.',
      salesArguments: 'Cada cliente que falta é dinheiro perdido na mesa. A automação garante que o cliente confirme a presença com 24h de antecedência.',
    },
    {
      category: 'AI_AGENTS',
      name: 'Agente de IA para Atendimento Humanizado',
      description: 'Assistente inteligente treinado com as informações da empresa capaz de tirar dúvidas complexas e conduzir a venda.',
      benefits: 'Linguagem natural indistinguível de um atendente humano, disponível 24 horas, qualificação profunda de perfil.',
      startingPrice: 2200.0,
      estimatedDays: 12,
      targetAudience: 'Negócios que recebem muitas dúvidas antes do fechamento (estética, imobiliárias, cursos, advocacia).',
      salesArguments: 'Seu cliente quer tirar dúvidas às 23h de um domingo. O agente de IA atende na hora, tira as dúvidas e já agenda o atendimento.',
    },
  ];

  for (const s of services) {
    const existing = await prisma.serviceCatalog.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.serviceCatalog.create({ data: s });
    }
  }
  console.log(`Catálogo de serviços cadastrado (${services.length} serviços).`);

  // 3. Criar Conta do Instagram Conectada para Demonstração Oficial
  const igAccount = await prisma.instagramAccount.upsert({
    where: { instagramId: 'gfsites_oficial_demo' },
    update: {},
    create: {
      instagramId: 'gfsites_oficial_demo',
      username: 'gfsites.automacoes',
      name: 'GFSites & Automações',
      profilePicUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      followersCount: 4820,
      mediaCount: 142,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
      syncCount: 3,
    },
  });

  // 4. Inserir Leads Representativos para Testes e Validação Completa
  const demoLeads = [
    {
      companyName: 'Clínica Sorriso & Arte Odontologia',
      tradeName: 'Sorriso & Arte',
      username: 'sorrisoeartedonto',
      bio: 'Transformando sorrisos com odontologia moderna e humanizada ✨ Implantes, Ortodontia e Estética Dental. Agende sua avaliação!',
      bioLink: 'https://wa.me/5511998765432',
      segment: 'Clínica odontológica',
      followersCount: 3620,
      postsCount: 184,
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1500 - Bela Vista',
      websiteStatus: 'SEM SITE',
      leadScore: 90,
      scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
      pipelineStage: 'QUALIFICADO',
      dealValue: 2400.0,
      notes: 'Clínica muito ativa no Instagram, postando reels diários, mas sem site nenhum. Contato direto via WhatsApp.',
      contacts: [
        { type: 'WHATSAPP', value: '11998765432', isPrimary: true },
        { type: 'PHONE', value: '1132456789', isPrimary: false }
      ]
    },
    {
      companyName: 'Dra. Camila Vasconcelos - Dermatologia',
      tradeName: 'Dra. Camila Vasconcelos',
      username: 'dracamiladermato',
      bio: 'Médica Dermatologista CRM 184920. Procedimentos estéticos, toxina botulínica, bioestimuladores de colágeno e saúde da pele.',
      bioLink: 'https://linktr.ee/dracamiladermato',
      segment: 'Clínica médica',
      followersCount: 8940,
      postsCount: 312,
      city: 'Campinas',
      state: 'SP',
      address: 'Rua Barreto Leme, 890 - Cambuí',
      websiteStatus: 'PRESENÇA DIGITAL FRACA',
      leadScore: 75,
      scoreTier: 'ALTO POTENCIAL',
      pipelineStage: 'AGUARDANDO_ABORDAGEM',
      dealValue: 1800.0,
      notes: 'Usa Linktree genérico com 5 botões. Grande oportunidade para uma Landing Page institucional com seu próprio nome.',
      contacts: [
        { type: 'WHATSAPP', value: '19988776655', isPrimary: true }
      ]
    },
    {
      companyName: 'Reserva & Sabor Bistrô Contemporâneo',
      tradeName: 'Reserva & Sabor',
      username: 'reservasaborbistro',
      bio: 'Gastronomia afetiva com ingredientes frescos da estação. Jantares intimistas de terça a domingo. Faça sua reserva antecipada.',
      bioLink: 'http://www.reservasaborbistro.com.br',
      segment: 'Restaurante e Gastronomia',
      followersCount: 5120,
      postsCount: 95,
      city: 'Curitiba',
      state: 'PR',
      address: 'Rua Comendador Araújo, 420 - Batel',
      websiteStatus: 'SITE COM PROBLEMAS',
      leadScore: 80,
      scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
      pipelineStage: 'NOVO_LEAD',
      dealValue: 1800.0,
      notes: 'O site cadastrado está dando erro 502 Bad Gateway e sem SSL válido. Estão perdendo reservas.',
      contacts: [
        { type: 'WHATSAPP', value: '41977665544', isPrimary: true },
        { type: 'EMAIL', value: 'contato@reservasabor.com.br', isPrimary: false }
      ]
    },
    {
      companyName: 'Mendonça & Associados Advocacia',
      tradeName: 'Mendonça Advocacia',
      username: 'mendonca.adv.br',
      bio: 'Assessoria jurídica empresarial, trabalhista e contratos estratégicos para empresas em crescimento. OAB/SP 45.120',
      bioLink: null,
      segment: 'Escritório de advocacia',
      followersCount: 1420,
      postsCount: 42,
      city: 'Ribeirão Preto',
      state: 'SP',
      address: 'Av. Presidente Vargas, 2100',
      websiteStatus: 'SEM SITE',
      leadScore: 85,
      scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
      pipelineStage: 'PRIMEIRO_CONTATO',
      dealValue: 2400.0,
      notes: 'Não tem link na bio e nenhuma presença no Google. Oportunidade prioritária de site institucional formal.',
      contacts: [
        { type: 'PHONE', value: '1636251400', isPrimary: true },
        { type: 'EMAIL', value: 'contato@mendoncaadv.com.br', isPrimary: false }
      ]
    },
    {
      companyName: 'Studio Bella Estética Avançada',
      tradeName: 'Studio Bella',
      username: 'studiobella.estetica',
      bio: 'Realçando sua beleza natural. Harmonização corporal e facial, laser, emagrecimento saudável e protocolos exclusivos.',
      bioLink: 'https://wa.me/5511971234567',
      segment: 'Estética e Bem-estar',
      followersCount: 6730,
      postsCount: 240,
      city: 'Santo André',
      state: 'SP',
      address: 'Rua das Figueiras, 650',
      websiteStatus: 'SEM SITE',
      leadScore: 90,
      scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
      pipelineStage: 'INTERESSADO',
      dealValue: 2650.0,
      notes: 'Demonstrou interesse em site e automação de agendamento no WhatsApp para desafogar as recepcionistas.',
      contacts: [
        { type: 'WHATSAPP', value: '11971234567', isPrimary: true }
      ]
    },
    {
      companyName: 'Vanguard Imóveis Prime',
      tradeName: 'Vanguard Imóveis',
      username: 'vanguardimoveisprime',
      bio: 'Imóveis de alto padrão e condomínios fechados em Alphaville e Tamboré. CRECI 34210-J.',
      bioLink: 'https://www.vanguardimoveis.com.br',
      segment: 'Imobiliária e Corretores',
      followersCount: 14200,
      postsCount: 520,
      city: 'Barueri',
      state: 'SP',
      address: 'Alameda Rio Negro, 1100 - Alphaville',
      websiteStatus: 'SITE IDENTIFICADO',
      leadScore: 30,
      scoreTier: 'BAIXA PRIORIDADE',
      pipelineStage: 'LEAD_ANALISADO',
      dealValue: 2200.0,
      notes: 'Possui site ativo funcional. Foco comercial deve ser em Agente de IA para WhatsApp.',
      contacts: [
        { type: 'WHATSAPP', value: '11965432100', isPrimary: true }
      ]
    }
  ];

  for (const leadData of demoLeads) {
    const existing = await prisma.lead.findFirst({ where: { username: leadData.username } });
    if (!existing) {
      const createdLead = await prisma.lead.create({
        data: {
          companyName: leadData.companyName,
          tradeName: leadData.tradeName,
          username: leadData.username,
          bio: leadData.bio,
          bioLink: leadData.bioLink,
          segment: leadData.segment,
          followersCount: leadData.followersCount,
          postsCount: leadData.postsCount,
          city: leadData.city,
          state: leadData.state,
          address: leadData.address,
          websiteStatus: leadData.websiteStatus,
          leadScore: leadData.leadScore,
          scoreTier: leadData.scoreTier,
          pipelineStage: leadData.pipelineStage,
          dealValue: leadData.dealValue,
          notes: leadData.notes,
          assignedUserId: adminUser.id,
        },
      });

      // Cadastrar Contatos
      for (const c of leadData.contacts) {
        await prisma.leadContact.create({
          data: {
            leadId: createdLead.id,
            type: c.type,
            value: c.value,
            isPrimary: c.isPrimary,
          },
        });
      }

      // Detalhar Lead Score
      await prisma.leadScore.create({
        data: {
          leadId: createdLead.id,
          totalScore: leadData.leadScore,
          noSiteScore: leadData.websiteStatus === 'SEM SITE' ? 35 : (leadData.websiteStatus === 'PRESENÇA DIGITAL FRACA' ? 20 : 0),
          brokenSiteScore: leadData.websiteStatus === 'SITE COM PROBLEMAS' ? 25 : 0,
          activeInstagramScore: 15,
          phoneScore: 10,
          whatsappScore: 10,
          locationScore: 5,
        },
      });

      // Registrar Atividade Inicial na Timeline
      await prisma.leadActivity.create({
        data: {
          leadId: createdLead.id,
          userId: adminUser.id,
          type: 'AI_ANALYSIS',
          title: 'Lead qualificado e classificado no sistema',
          description: `Identificado perfil ${leadData.segment}. Status de website: ${leadData.websiteStatus}. Lead Score: ${leadData.leadScore}/100.`,
          channel: 'INSTAGRAM_DIRECT',
        },
      });
    }
  }

  console.log(`Leads de demonstração inseridos com sucesso (${demoLeads.length} leads).`);
  console.log('--- Seed Concluído com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
