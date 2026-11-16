'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import NewLeadModal from '@/components/leads/NewLeadModal';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Zap,
  Globe,
  AlertTriangle,
  Bot,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState('ALL');
  const [segment, setSegment] = useState('ALL');
  const [pipelineStage, setPipelineStage] = useState('ALL');
  const [scoreTier, setScoreTier] = useState('ALL');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (websiteStatus !== 'ALL') params.append('websiteStatus', websiteStatus);
      if (segment !== 'ALL') params.append('segment', segment);
      if (pipelineStage !== 'ALL') params.append('pipelineStage', pipelineStage);
      if (scoreTier !== 'ALL') params.append('scoreTier', scoreTier);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [websiteStatus, segment, pipelineStage, scoreTier]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleActiveVerify = async (leadId: string) => {
    setVerifyingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;

    const headers = [
      'Empresa',
      'Instagram',
      'Segmento',
      'Status_Website',
      'Lead_Score',
      'Tier',
      'Etapa_Funil',
      'Cidade',
      'Estado',
      'WhatsApp',
      'Link_Bio',
    ];

    const rows = leads.map((l) => [
      `"${l.companyName.replace(/"/g, '""')}"`,
      `"@${l.username}"`,
      `"${l.segment}"`,
      `"${l.websiteStatus}"`,
      l.leadScore,
      `"${l.scoreTier}"`,
      `"${l.pipelineStage}"`,
      `"${l.city || ''}"`,
      `"${l.state || ''}"`,
      `"${l.contacts?.find((c: any) => c.type === 'WHATSAPP')?.value || ''}"`,
      `"${l.bioLink || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_prospect_gfsites_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWebsiteBadge = (status: string) => {
    switch (status) {
      case 'SEM SITE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <Flame className="w-3 h-3" />
            <span>SEM SITE</span>
          </span>
        );
      case 'SITE COM PROBLEMAS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>SITE COM PROBLEMAS</span>
          </span>
        );
      case 'PRESENÇA DIGITAL FRACA':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <span>PRESENÇA FRACA</span>
          </span>
        );
      case 'SITE IDENTIFICADO':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Globe className="w-3 h-3" />
            <span>SITE IDENTIFICADO</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-700/50 text-gray-400 border border-gray-600/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        onOpenNewLead={() => setIsModalOpen(true)}
        title="Gestão de Leads & Oportunidades"
        subtitle="Identificação de empresas, status de website e qualificação comercial"
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Barra de Filtros e Pesquisa */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F293D] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Busca Rápida */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por empresa, @username, cidade ou biografia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </form>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Website */}
            <select
              value={websiteStatus}
              onChange={(e) => setWebsiteStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">Status do Site: Todos</option>
              <option value="SEM SITE">🔥 SEM SITE (Prioridade 1)</option>
              <option value="SITE COM PROBLEMAS">⚠️ SITE COM PROBLEMAS</option>
              <option value="PRESENÇA DIGITAL FRACA">📱 PRESENÇA FRACA (Linktree)</option>
              <option value="SITE IDENTIFICADO">🌐 SITE IDENTIFICADO</option>
            </select>

            {/* Segmento */}
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">Segmento: Todos</option>
              <option value="Clínica odontológica">Clínica odontológica</option>
              <option value="Clínica médica">Clínica médica</option>
              <option value="Estética e Bem-estar">Estética e Bem-estar</option>
              <option value="Restaurante e Gastronomia">Restaurante e Gastronomia</option>
              <option value="Escritório de advocacia">Escritório de advocacia</option>
              <option value="Imobiliária e Corretores">Imobiliária e Corretores</option>
              <option value="Barbearia">Barbearia</option>
              <option value="Salão de beleza">Salão de beleza</option>
            </select>

            {/* Lead Score */}
            <select
              value={scoreTier}
              onChange={(e) => setScoreTier(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">Score: Todos</option>
              <option value="OPORTUNIDADE PRIORITÁRIA">80 - 100: Prioritária</option>
              <option value="ALTO POTENCIAL">60 - 79: Alto Potencial</option>
              <option value="POTENCIAL MODERADO">40 - 59: Moderado</option>
            </select>

            {/* Botão Exportar CSV */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-colors"
              title="Exportar dados filtrados para Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Tabela de Leads */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Carregando oportunidades comerciais...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Globe className="w-8 h-8 text-gray-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">Nenhum lead encontrado</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Não há registros com os filtros atuais. Experimente limpar os filtros ou cadastrar novos potenciais clientes.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors"
              >
                Cadastrar Novo Lead
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F293D] bg-[#0B0F19]/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Empresa / Negócio</th>
                    <th className="py-3 px-4">Presença de Website</th>
                    <th className="py-3 px-4">Lead Score</th>
                    <th className="py-3 px-4">Segmento</th>
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4">Etapa do Funil</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F293D]/60 text-xs text-gray-200">
                  {leads.map((lead) => {
                    const whatsapp = lead.contacts?.find((c: any) => c.type === 'WHATSAPP')?.value;
                    const location = [lead.city, lead.state].filter(Boolean).join(', ');

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-surface-cardHover/70 transition-colors group"
                      >
                        {/* Coluna 1: Empresa & Instagram */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-bold text-white hover:text-brand-400 transition-colors"
                            >
                              {lead.companyName}
                            </Link>
                            <a
                              href={`https://instagram.com/${lead.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1 mt-0.5"
                            >
                              <span>@{lead.username}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </td>

                        {/* Coluna 2: Status do Site */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col space-y-1">
                            {getWebsiteBadge(lead.websiteStatus)}
                            {lead.bioLink && (
                              <span
                                className="text-[10px] text-gray-400 truncate max-w-[180px]"
                                title={lead.bioLink}
                              >
                                {lead.bioLink}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Coluna 3: Lead Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                              {lead.leadScore}
                            </div>
                            <div className="text-[10px]">
                              <span className="font-semibold text-gray-300 block">{lead.scoreTier}</span>
                              <span className="text-gray-400">máx 100 pts</span>
                            </div>
                          </div>
                        </td>

                        {/* Coluna 4: Segmento */}
                        <td className="py-3.5 px-4 text-gray-300 font-medium">
                          {lead.segment}
                        </td>

                        {/* Coluna 5: Localização */}
                        <td className="py-3.5 px-4 text-gray-400">
                          {location || <span className="text-gray-600">Não informado</span>}
                        </td>

                        {/* Coluna 6: Etapa do Funil */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#1F293D] text-[10px] font-semibold text-cyan-300 border border-[#374151]">
                            {lead.pipelineStage.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Coluna 7: Ações Rápidas */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Re-verificar Site */}
                            <button
                              onClick={() => handleActiveVerify(lead.id)}
                              disabled={verifyingId === lead.id}
                              className="p-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#1F293D] text-gray-400 hover:text-white border border-[#1F293D] transition-colors"
                              title="Executar verificação ativa de domínio e presença de website"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${verifyingId === lead.id ? 'animate-spin text-brand-400' : ''}`}
                              />
                            </button>

                            {/* WhatsApp Direto */}
                            {whatsapp && (
                              <a
                                href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Olá! Tudo bem? Me chamo Gean, responsável pela GFSites & Automações. Conheci o trabalho da ${lead.companyName} pelo Instagram e gostaria de compartilhar uma oportunidade de posicionamento comercial.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                                title="Enviar mensagem no WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Link de Detalhes */}
                            <Link
                              href={`/leads/${lead.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 font-semibold text-xs flex items-center space-x-1 transition-colors"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={fetchLeads}
      />
    </div>
  );
}
