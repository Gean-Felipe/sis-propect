import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebsitePresence } from '@/lib/website-checker';
import { calculateLeadScore } from '@/lib/lead-scoring';
import { detectSegment } from '@/lib/ai-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvData, items } = body;

    let rows: any[] = [];

    if (Array.isArray(items) && items.length > 0) {
      rows = items;
    } else if (csvData && typeof csvData === 'string') {
      rows = parseCsvString(csvData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Envie um CSV ou array de contatos válido.' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum registro válido encontrado no arquivo.' },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const companyName = row.companyName || row.nome || row.empresa || row.perfil || row.username;
        const rawUsername = row.username || row.perfil || row.instagram || row.arroba || '';
        if (!companyName && !rawUsername) continue;

        const sanitizedUsername = rawUsername.replace(/^@/, '').trim().toLowerCase();
        const bioLink = row.bioLink || row.link || row.website || row.site || '';
        const bio = row.bio || row.biografia || '';
        const city = row.city || row.cidade || '';
        const state = row.state || row.estado || '';
        const phone = row.phone || row.telefone || '';
        const whatsapp = row.whatsapp || '';

        // 1. Diagnóstico do Website
        const websiteDiag = await verifyWebsitePresence(bioLink, companyName, bio);

        // 2. Detecção de Segmento
        const segment = row.segment || detectSegment(companyName, bio);

        // 3. Lead Score
        const scoreResult = calculateLeadScore({
          websiteStatus: websiteDiag.resultStatus,
          hasActiveInstagram: true,
          hasPhone: Boolean(phone),
          hasWhatsApp: Boolean(whatsapp),
          hasLocation: Boolean(city || state),
        });

        const existing = sanitizedUsername
          ? await prisma.lead.findFirst({ where: { username: sanitizedUsername } })
          : null;

        if (existing) {
          await prisma.lead.update({
            where: { id: existing.id },
            data: {
              companyName: companyName || existing.companyName,
              bio: bio || existing.bio,
              bioLink: bioLink || existing.bioLink,
              segment: segment || existing.segment,
              city: city || existing.city,
              state: state || existing.state,
              websiteStatus: websiteDiag.resultStatus,
              verifiedDomain: websiteDiag.verifiedDomain,
              leadScore: scoreResult.totalScore,
              scoreTier: scoreResult.tier,
            },
          });
          updatedCount++;
        } else {
          const newLead = await prisma.lead.create({
            data: {
              companyName,
              tradeName: row.tradeName || companyName,
              username: sanitizedUsername || `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              profileUrl: sanitizedUsername ? `https://instagram.com/${sanitizedUsername}` : null,
              bio,
              bioLink,
              segment,
              followersCount: Number(row.followersCount || row.seguidores || 0),
              postsCount: Number(row.postsCount || row.publicacoes || 0),
              city,
              state,
              websiteStatus: websiteDiag.resultStatus,
              verifiedDomain: websiteDiag.verifiedDomain,
              leadScore: scoreResult.totalScore,
              scoreTier: scoreResult.tier,
              pipelineStage: 'NOVO_LEAD',
              notes: 'Importado via planilha CSV.',
            },
          });

          // Inserir contatos
          const contacts = [];
          if (whatsapp) contacts.push({ leadId: newLead.id, type: 'WHATSAPP', value: String(whatsapp), isPrimary: true });
          if (phone) contacts.push({ leadId: newLead.id, type: 'PHONE', value: String(phone), isPrimary: !whatsapp });
          if (row.email) contacts.push({ leadId: newLead.id, type: 'EMAIL', value: String(row.email), isPrimary: false });

          if (contacts.length > 0) {
            await prisma.leadContact.createMany({ data: contacts });
          }

          // Inserir verificação de website
          await prisma.leadWebsiteCheck.create({
            data: {
              leadId: newLead.id,
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

          // Inserir Score
          await prisma.leadScore.create({
            data: {
              leadId: newLead.id,
              totalScore: scoreResult.totalScore,
              noSiteScore: scoreResult.breakdown.noSiteScore,
              brokenSiteScore: scoreResult.breakdown.brokenSiteScore,
              activeInstagramScore: scoreResult.breakdown.activeInstagramScore,
              phoneScore: scoreResult.breakdown.phoneScore,
              whatsappScore: scoreResult.breakdown.whatsappScore,
              locationScore: scoreResult.breakdown.locationScore,
            },
          });

          createdCount++;
        }
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    // Registrar Job
    await prisma.syncJob.create({
      data: {
        sourceType: 'CSV_IMPORT',
        status: errors.length > 0 && createdCount === 0 ? 'FAILED' : 'COMPLETED',
        recordsImported: createdCount,
        recordsUpdated: updatedCount,
        details: JSON.stringify({ totalParsed: rows.length, errors }),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${createdCount} novos leads adicionados, ${updatedCount} atualizados.`,
      createdCount,
      updatedCount,
      errorsCount: errors.length,
    });
  } catch (error: any) {
    console.error('Erro na importação CSV:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar arquivo' },
      { status: 500 }
    );
  }
}

function parseCsvString(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    if (values.length <= 1) continue;

    const rowObj: any = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || '';
    });
    result.push(rowObj);
  }

  return result;
}
