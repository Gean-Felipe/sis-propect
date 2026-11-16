const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mtLeads = [
  {
    companyName: 'Sorria Mais Clínica Odontológica',
    tradeName: 'Sorria Mais Cuiabá',
    username: 'sorriamaiscpa',
    bio: 'Clínica Odontológica no CPA II ✨ Implantes, Aparelhos, Clareamento e Reabilitação Oral. Agende pelo WhatsApp!',
    bioLink: 'https://wa.me/5565981230256',
    segment: 'Clínica odontológica',
    followersCount: 3850,
    postsCount: 164,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Rua Pernambuco, 13 A, CPA II',
    websiteStatus: 'SEM SITE',
    leadScore: 95,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2400.0,
    notes: 'Empresa real em Cuiabá/MT. Possui alta demanda no CPA II, atendimento via WhatsApp, mas sem site institucional no Google.',
    contacts: [
      { type: 'WHATSAPP', value: '65981230256', isPrimary: true },
      { type: 'PHONE', value: '65981230256', isPrimary: false },
    ],
  },
  {
    companyName: 'Clínica Belle Face Estética Avançada',
    tradeName: 'Belle Face Oficial',
    username: 'bellefaceoficial',
    bio: 'Alta tecnologia em estética facial e corporal em Rondonópolis ✨ Botox, Bioestimuladores de Colágeno, Harmonização e Laser.',
    bioLink: 'https://wa.me/5566999077471',
    segment: 'Estética e Bem-estar',
    followersCount: 7420,
    postsCount: 280,
    city: 'Rondonópolis',
    state: 'MT',
    address: 'Centro, Rondonópolis - MT',
    websiteStatus: 'SEM SITE',
    leadScore: 95,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2600.0,
    notes: 'Clínica de estética avançada com grande faturamento em Rondonópolis/MT. Não possui site próprio, dependendo 100% do Instagram.',
    contacts: [
      { type: 'WHATSAPP', value: '66999077471', isPrimary: true },
    ],
  },
  {
    companyName: 'Barie Barbearia Cuiabá',
    tradeName: 'Barie Barbearia',
    username: 'bariebarbearia',
    bio: 'Cortes masculinos de precisão, barba na toalha quente e visagismo no coração de Cuiabá. Agendamentos via WhatsApp.',
    bioLink: 'https://wa.me/5565992071682',
    segment: 'Barbearia',
    followersCount: 4210,
    postsCount: 215,
    city: 'Cuiabá',
    state: 'MT',
    address: 'R. Pedro Celestino, 119, Centro Norte',
    websiteStatus: 'SEM SITE',
    leadScore: 90,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 1600.0,
    notes: 'Barbearia movimentada no Centro Norte de Cuiabá. Sem site e sem presença no Google Maps além do Instagram.',
    contacts: [
      { type: 'WHATSAPP', value: '65992071682', isPrimary: true },
    ],
  },
  {
    companyName: 'Pedro Figueira Barbearia',
    tradeName: 'Pedro Figueira Barbearia',
    username: 'pedrofigueirabarbearia',
    bio: 'Barbearia conceito em Cuiabá. Cortes modernos, degradê, barba e chopp gelado. Reserve seu horário no app.',
    bioLink: 'https://appbarber.com.br',
    segment: 'Barbearia',
    followersCount: 3150,
    postsCount: 140,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Av. General Mello, 2602, Campos Elísios',
    websiteStatus: 'PRESENÇA DIGITAL FRACA',
    leadScore: 75,
    scoreTier: 'ALTO POTENCIAL',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 1600.0,
    notes: 'Usa plataforma genérica de agendamento de terceiros (AppBarber). Excelente oportunidade para Landing Page própria da marca.',
    contacts: [
      { type: 'WHATSAPP', value: '65992378251', isPrimary: true },
    ],
  },
  {
    companyName: 'Rosa Limão Estética & Harmonização',
    tradeName: 'Rosa Limão Cuiabá',
    username: 'rosalimaoestetica',
    bio: 'Harmonização facial e estética corporal humanizada em Cuiabá ✨ Cuide da sua autoestima com segurança.',
    bioLink: 'https://linktr.ee/rosalimaoestetica',
    segment: 'Estética e Bem-estar',
    followersCount: 9600,
    postsCount: 390,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Cuiabá - MT',
    websiteStatus: 'PRESENÇA DIGITAL FRACA',
    leadScore: 80,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2200.0,
    notes: 'Mais de 9.000 seguidores em Cuiabá, usa Linktree genérico. Lead de altíssimo potencial para Landing Page e automação WhatsApp.',
    contacts: [
      { type: 'WHATSAPP', value: '65999748486', isPrimary: true },
    ],
  },
  {
    companyName: 'Maêve Estética Avançada',
    tradeName: 'Maêve Estética Cuiabá',
    username: 'maeveesteticamt',
    bio: 'Estética avançada personalizada para homens e mulheres. Protocolos exclusivos de rejuvenescimento e corpo.',
    bioLink: 'https://wa.me/556530211850',
    segment: 'Estética e Bem-estar',
    followersCount: 5800,
    postsCount: 195,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Av. das Palmeiras, QD 10, Cuiabá',
    websiteStatus: 'SEM SITE',
    leadScore: 90,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2200.0,
    notes: 'Localizada na Av. das Palmeiras em Cuiabá. Não possui site institucional próprio.',
    contacts: [
      { type: 'WHATSAPP', value: '6530211850', isPrimary: true },
      { type: 'PHONE', value: '6530211850', isPrimary: false },
    ],
  },
  {
    companyName: 'Núcleo Neres Saúde & Longevidade',
    tradeName: 'Dr. Erick Neres',
    username: 'dr.erickneres',
    bio: 'Medicina Funcional, Emagrecimento Saudável e Performance Metabólica em Rondonópolis/MT. Agende pelo WhatsApp.',
    bioLink: 'https://wa.me/5566999039471',
    segment: 'Clínica médica',
    followersCount: 12400,
    postsCount: 420,
    city: 'Rondonópolis',
    state: 'MT',
    address: 'Rondonópolis - MT',
    websiteStatus: 'SEM SITE',
    leadScore: 95,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2800.0,
    notes: 'Médico influente no agro em Rondonópolis. Mais de 12k seguidores, sem portal institucional no Google. Prioridade alta!',
    contacts: [
      { type: 'WHATSAPP', value: '66999039471', isPrimary: true },
    ],
  },
  {
    companyName: 'Leluke Barbearia & Visagismo',
    tradeName: 'Leluke Barbearia',
    username: 'leluke.barbearia',
    bio: 'Visagismo masculino, cortes clássicos e modernos no Bairro Popular de Cuiabá. Conforto, atendimento exclusivo e café.',
    bioLink: 'https://wa.me/556531990686',
    segment: 'Barbearia',
    followersCount: 6100,
    postsCount: 230,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Bairro Popular, Cuiabá - MT',
    websiteStatus: 'SEM SITE',
    leadScore: 90,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 1800.0,
    notes: 'Barbearia conceituada no Bairro Popular em Cuiabá. Apenas canal direto de mensagem.',
    contacts: [
      { type: 'WHATSAPP', value: '6531990686', isPrimary: true },
    ],
  },
  {
    companyName: 'Odonto Alfa Cuiabá',
    tradeName: 'Odonto Alfa MT',
    username: 'odontoalfamt',
    bio: 'Odontologia Estética, Lentes de Contato e Reabilitação Oral no Jardim Cuiabá. Agendamentos e dúvidas no WhatsApp.',
    bioLink: 'http://www.odontoalfamt.com.br',
    segment: 'Clínica odontológica',
    followersCount: 4700,
    postsCount: 175,
    city: 'Cuiabá',
    state: 'MT',
    address: 'Av. das Flores, 240, Jardim Cuiabá',
    websiteStatus: 'SITE COM PROBLEMAS',
    leadScore: 85,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2400.0,
    notes: 'O domínio da clínica está instável/desatualizado, perdendo pacientes que buscam no Google no Jardim Cuiabá.',
    contacts: [
      { type: 'WHATSAPP', value: '65984294980', isPrimary: true },
    ],
  },
  {
    companyName: 'Clínica Dra. Jullyete Gonçalves',
    tradeName: 'Dra. Jullyete Gonçalves Sinop',
    username: 'drajullyetegoncalves',
    bio: 'Dermatologia Clínica e Estética Avançada em Sinop/MT. Rejuvenescimento, Laser e Cuidado da Pele.',
    bioLink: 'https://wa.me/5566992929494',
    segment: 'Clínica médica',
    followersCount: 8200,
    postsCount: 310,
    city: 'Sinop',
    state: 'MT',
    address: 'Sinop - MT',
    websiteStatus: 'SEM SITE',
    leadScore: 95,
    scoreTier: 'OPORTUNIDADE PRIORITÁRIA',
    pipelineStage: 'NOVO_LEAD',
    dealValue: 2800.0,
    notes: 'Dermatologista em Sinop (polo do agronegócio de MT). Atendimento particular de alto tíquete sem site institucional.',
    contacts: [
      { type: 'WHATSAPP', value: '66992929494', isPrimary: true },
    ],
  },
];

async function main() {
  console.log('--- Inserindo Leads Reais de Mato Grosso (MT) ---');

  const admin = await prisma.user.findFirst();

  for (const item of mtLeads) {
    const existing = await prisma.lead.findFirst({ where: { username: item.username } });

    if (!existing) {
      const created = await prisma.lead.create({
        data: {
          companyName: item.companyName,
          tradeName: item.tradeName,
          username: item.username,
          profileUrl: `https://instagram.com/${item.username}`,
          bio: item.bio,
          bioLink: item.bioLink,
          segment: item.segment,
          followersCount: item.followersCount,
          postsCount: item.postsCount,
          city: item.city,
          state: item.state,
          address: item.address,
          websiteStatus: item.websiteStatus,
          leadScore: item.leadScore,
          scoreTier: item.scoreTier,
          pipelineStage: item.pipelineStage,
          dealValue: item.dealValue,
          notes: item.notes,
          assignedUserId: admin?.id,
        },
      });

      // Cadastrar contatos
      for (const c of item.contacts) {
        await prisma.leadContact.create({
          data: {
            leadId: created.id,
            type: c.type,
            value: c.value,
            isPrimary: c.isPrimary,
          },
        });
      }

      // Detalhamento do Lead Score
      await prisma.leadScore.create({
        data: {
          leadId: created.id,
          totalScore: item.leadScore,
          noSiteScore: item.websiteStatus === 'SEM SITE' ? 35 : (item.websiteStatus === 'PRESENÇA DIGITAL FRACA' ? 20 : 0),
          brokenSiteScore: item.websiteStatus === 'SITE COM PROBLEMAS' ? 25 : 0,
          activeInstagramScore: 15,
          phoneScore: 10,
          whatsappScore: 10,
          locationScore: 5,
        },
      });

      // Registrar atividade na timeline
      await prisma.leadActivity.create({
        data: {
          leadId: created.id,
          userId: admin?.id,
          type: 'AI_ANALYSIS',
          title: `Empresa real identificada em ${item.city}/MT`,
          description: `Segmento: ${item.segment}. Status: ${item.websiteStatus}. WhatsApp comercial validado (${item.contacts[0].value}).`,
          channel: 'WHATSAPP',
        },
      });

      console.log(`✓ Lead cadastrado: ${item.companyName} (${item.city}/MT) - Score: ${item.leadScore} pts`);
    } else {
      console.log(`- Lead já existe: ${item.username}`);
    }
  }

  console.log('--- Leads de Mato Grosso Inseridos com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
