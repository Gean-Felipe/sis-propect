import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebsitePresence } from '@/lib/website-checker';
import { calculateLeadScore } from '@/lib/lead-scoring';
import { detectSegment } from '@/lib/ai-engine';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificação de Autenticação / Segurança
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'gfsites_secret_key_prospect_2026';

    if (apiKey && apiKey !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Chave de API inválida.' },
        { status: 401 }
      );
    }

    const payload = await request.json();

    // Pode ser um único lead ou um array de leads
    const leadsToProcess = Array.isArray(payload) ? payload : (payload.leads ? payload.leads : [payload]);

    const results = [];
    let importedCount = 0;
    let updatedCount = 0;

    for (const item of leadsToProcess) {
      const companyName = item.companyName || item.name || item.empresa || item.username;
      const rawUsername = item.username || item.perfil || item.instagram || '';

      if (!companyName && !rawUsername) continue;

      const sanitizedUsername = rawUsername.replace(/^@/, '').trim().toLowerCase();

      // Checagem de website
      const websiteDiag = await verifyWebsitePresence(
        item.bioLink || item.website || item.site || item.link,
        companyName,
        item.bio || item.biografia
      );

      // Segmento
      const segment = item.segment || detectSegment(companyName, item.bio);

      // Cálculo de pontuação
      const hasPhone = Boolean(item.phone || item.telefone);
      const hasWhatsApp = Boolean(item.whatsapp);
      const hasLocation = Boolean(item.city || item.cidade || item.state || item.estado);
      const hasActiveInstagram = Number(item.followersCount || item.seguidores || 0) > 50;

      const scoreResult = calculateLeadScore({
        websiteStatus: websiteDiag.resultStatus,
        hasActiveInstagram,
        hasPhone,
        hasWhatsApp,
        hasLocation,
      });

      // Upsert por username
      const existing = sanitizedUsername
        ? await prisma.lead.findFirst({ where: { username: sanitizedUsername } })
        : null;

      if (existing) {
        const updated = await prisma.lead.update({
          where: { id: existing.id },
          data: {
            companyName: companyName || existing.companyName,
            bio: item.bio || existing.bio,
            bioLink: item.bioLink || existing.bioLink,
            segment: segment || existing.segment,
            city: item.city || item.cidade || existing.city,
            state: item.state || item.estado || existing.state,
            websiteStatus: websiteDiag.resultStatus,
            verifiedDomain: websiteDiag.verifiedDomain,
            leadScore: scoreResult.totalScore,
            scoreTier: scoreResult.tier,
          },
        });
        updatedCount++;
        results.push({ id: updated.id, username: updated.username, status: 'UPDATED', score: scoreResult.totalScore });
      } else {
        const created = await prisma.lead.create({
          data: {
            companyName,
            tradeName: item.tradeName || companyName,
            username: sanitizedUsername || `lead_${Date.now()}`,
            profileUrl: sanitizedUsername ? `https://instagram.com/${sanitizedUsername}` : null,
            bio: item.bio || item.biografia,
            bioLink: item.bioLink || item.website || item.site || item.link,
            segment,
            followersCount: Number(item.followersCount || item.seguidores || 0),
            postsCount: Number(item.postsCount || item.publicacoes || 0),
            city: item.city || item.cidade,
            state: item.state || item.estado,
            websiteStatus: websiteDiag.resultStatus,
            verifiedDomain: websiteDiag.verifiedDomain,
            leadScore: scoreResult.totalScore,
            scoreTier: scoreResult.tier,
            pipelineStage: 'NOVO_LEAD',
            notes: `Importado via webhook de automação n8n em ${new Date().toLocaleString('pt-BR')}.`,
          },
        });

        // Contatos
        const contactsToCreate = [];
        if (item.whatsapp) {
          contactsToCreate.push({ leadId: created.id, type: 'WHATSAPP', value: String(item.whatsapp), isPrimary: true });
        }
        if (item.phone || item.telefone) {
          contactsToCreate.push({ leadId: created.id, type: 'PHONE', value: String(item.phone || item.telefone), isPrimary: !item.whatsapp });
        }
        if (item.email) {
          contactsToCreate.push({ leadId: created.id, type: 'EMAIL', value: String(item.email), isPrimary: false });
        }

        if (contactsToCreate.length > 0) {
          await prisma.leadContact.createMany({ data: contactsToCreate });
        }

        // Salvar checagem
        await prisma.leadWebsiteCheck.create({
          data: {
            leadId: created.id,
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

        // Salvar Score
        await prisma.leadScore.create({
          data: {
            leadId: created.id,
            totalScore: scoreResult.totalScore,
            noSiteScore: scoreResult.breakdown.noSiteScore,
            brokenSiteScore: scoreResult.breakdown.brokenSiteScore,
            activeInstagramScore: scoreResult.breakdown.activeInstagramScore,
            phoneScore: scoreResult.breakdown.phoneScore,
            whatsappScore: scoreResult.breakdown.whatsappScore,
            locationScore: scoreResult.breakdown.locationScore,
          },
        });

        importedCount++;
        results.push({ id: created.id, username: created.username, status: 'CREATED', score: scoreResult.totalScore });
      }
    }

    // Registrar Job de Sincronização
    await prisma.syncJob.create({
      data: {
        sourceType: 'N8N_WEBHOOK',
        status: 'COMPLETED',
        recordsImported: importedCount,
        recordsUpdated: updatedCount,
        details: JSON.stringify({ processedCount: leadsToProcess.length, results }),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Processamento n8n concluído: ${importedCount} novos leads cadastrados e ${updatedCount} atualizados.`,
      importedCount,
      updatedCount,
      results,
    });
  } catch (error: any) {
    console.error('Erro no webhook n8n:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar webhook do n8n' },
      { status: 500 }
    );
  }
}
