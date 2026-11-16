'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Zap,
  Bot,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Send,
  Save,
  Tag,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Formulário de Nova Atividade na Timeline
  const [newActivity, setNewActivity] = useState({
    type: 'NOTE',
    title: '',
    description: '',
    channel: 'WHATSAPP',
  });
  const [savingActivity, setSavingActivity] = useState(false);

  // Alteração de Pipeline Stage
  const [selectedStage, setSelectedStage] = useState('');
  const [dealValue, setDealValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      const data = await res.json();
      if (data.success) {
        setLead(data.lead);
        setSelectedStage(data.lead.pipelineStage);
        setDealValue(data.lead.dealValue || 0);
        setNotes(data.lead.notes || '');
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do lead:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) fetchLeadDetails();
  }, [leadId]);

  const handleActiveVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchLeadDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setAnalyzingAi(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/ai-analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchLeadDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSaveStageAndNotes = async () => {
    setSavingLead(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineStage: selectedStage,
          dealValue,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeadDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLead(false);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[#090D16]">
        <Header title="Prontuário do Lead" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 flex flex-col bg-[#090D16] p-8 text-center text-gray-300">
        <p>Lead não encontrado.</p>
        <Link href="/leads" className="text-brand-400 mt-4 inline-block underline">
          Voltar para Leads
        </Link>
      </div>
    );
  }

  const whatsapp = lead.contacts?.find((c: any) => c.type === 'WHATSAPP')?.value;
  const phone = lead.contacts?.find((c: any) => c.type === 'PHONE')?.value;
  const email = lead.contacts?.find((c: any) => c.type === 'EMAIL')?.value;
  const latestAi = lead.aiAnalyses?.[0];
  const suggestedServices = latestAi ? JSON.parse(latestAi.suggestedServices || '[]') : [];

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        title={lead.companyName}
        subtitle={`Diagnóstico Comercial • @${lead.username} • ${lead.segment}`}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Barra Superior de Navegação */}
        <div className="flex items-center justify-between">
          <Link
            href="/leads"
            className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de Leads</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleActiveVerify}
              disabled={verifying}
              className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F293D] hover:border-brand-500 text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin text-brand-400' : 'text-gray-400'}`} />
              <span>{verifying ? 'Diagnosticando...' : 'Re-verificar Presença Digital'}</span>
            </button>

            <button
              onClick={handleRunAiAnalysis}
              disabled={analyzingAi}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md shadow-brand-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Bot className={`w-3.5 h-3.5 ${analyzingAi ? 'animate-spin' : ''}`} />
              <span>{analyzingAi ? 'Gerando Análise...' : 'Gerar Abordagem com IA'}</span>
            </button>
          </div>
        </div>

        {/* Card Principal de Identificação */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] grid grid-cols-1 lg:grid-cols-3 gap-6 relative overflow-hidden">
          {/* Coluna 1: Dados da Empresa */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">{lead.companyName}</h2>
                  {lead.websiteStatus === 'SEM SITE' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center space-x-1">
                      <Flame className="w-3 h-3" />
                      <span>SEM SITE</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                  <a
                    href={`https://instagram.com/${lead.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <span>@{lead.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <span className="text-gray-300 font-medium">{lead.segment}</span>
                  {lead.followersCount ? (
                    <>
                      <span>•</span>
                      <span>{lead.followersCount.toLocaleString('pt-BR')} seguidores</span>
                    </>
                  ) : null}
                  {(lead.city || lead.state) && (
                    <>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{[lead.city, lead.state].filter(Boolean).join(' - ')}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Biografia do Perfil */}
            {lead.bio && (
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-gray-300 leading-relaxed font-sans">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Biografia do Instagram
                </span>
                {lead.bio}
              </div>
            )}

            {/* Link da Bio & Canais de Contato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Link na Bio
                </span>
                {lead.bioLink ? (
                  <a
                    href={lead.bioLink.startsWith('http') ? lead.bioLink : `https://${lead.bioLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline flex items-center space-x-1 truncate"
                  >
                    <span className="truncate">{lead.bioLink}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-red-400 font-semibold">Nenhum link cadastrado na bio</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Canais de Contato
                </span>
                <div className="flex items-center space-x-3">
                  {whatsapp ? (
                    <a
                      href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{whatsapp}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">WhatsApp não identificado</span>
                  )}
                  {phone && <span className="text-gray-400 font-mono">{phone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Lead Scoring & Resumo de Qualificação */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0B0F19] to-[#111827] border border-[#1F293D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Lead Scoring
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {lead.scoreTier}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-4xl font-black text-white">{lead.leadScore}</span>
                <span className="text-xs font-medium text-gray-400">/ 100 pontos</span>
              </div>

              {/* Detalhamento dos Critérios de Pontuação */}
              <div className="space-y-2 text-xs border-t border-[#1F293D] pt-3">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Não possui site</span>
                  <span className="font-bold text-red-400 font-mono">
                    {lead.websiteStatus === 'SEM SITE' ? '+35 pts' : '+0 pts'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Instagram comercial ativo</span>
                  <span className="font-bold text-emerald-400 font-mono">+15 pts</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>WhatsApp comercial</span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {whatsapp ? '+10 pts' : '+0 pts'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Localização identificada</span>
                  <span className="font-bold text-gray-400 font-mono">
                    {lead.city || lead.state ? '+5 pts' : '+0 pts'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1F293D] text-[11px] text-gray-400">
              Maior pontuação = maior probabilidade de compra de um site próprio.
            </div>
          </div>
        </div>

        {/* Seção 2: Diagnóstico Ativo de Presença Digital & Evidências */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-white text-base">
                Diagnóstico de Presença Digital & Website
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Última verificação: {new Date(lead.updatedAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                Classificação
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {lead.websiteStatus}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                Domínio Próprio
              </span>
              <span className="text-sm font-semibold text-gray-300 mt-0.5 block">
                {lead.verifiedDomain || 'Não identificado'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                Uso de Agregador (Linktree)
              </span>
              <span className="text-sm font-semibold text-gray-300 mt-0.5 block">
                {lead.websiteStatus === 'PRESENÇA DIGITAL FRACA' ? 'Sim (Detectado)' : 'Não'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                Status da Conexão
              </span>
              <span className="text-sm font-semibold text-gray-300 mt-0.5 block">
                {lead.websiteStatus === 'SEM SITE' ? 'Sem domínio ativo' : 'Avaliando resposta'}
              </span>
            </div>
          </div>
        </div>

        {/* Seção 3: Inteligência Artificial (Abordagem e Soluções da GFSites) */}
        {latestAi ? (
          <div className="p-6 rounded-2xl bg-[#111827] border border-brand-500/30 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Inteligência Comercial & Abordagem Pronta (GFSites AI)
                </h3>
              </div>
              <span className="text-xs text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full font-semibold border border-brand-500/20">
                Gerado em {new Date(latestAi.generatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Diagnóstico da IA e Dor Comercial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                <h4 className="font-bold text-cyan-400 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diagnóstico Estratégico</span>
                </h4>
                <p className="text-gray-300 leading-relaxed">{latestAi.digitalDiagnosis}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Dor Comercial do Cliente</span>
                </h4>
                <p className="text-gray-300 leading-relaxed">{latestAi.commercialPain}</p>
              </div>
            </div>

            {/* Serviços da GFSites Recomendados */}
            {suggestedServices.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Soluções Recomendadas da GFSites
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedServices.map((srv: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] flex flex-col justify-between"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 mb-1.5 inline-block">
                          {srv.category}
                        </span>
                        <h5 className="font-bold text-white text-xs">{srv.name}</h5>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{srv.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem de Abordagem Personalizada Humanizada */}
            <div className="p-5 rounded-xl bg-[#0B0F19] border border-brand-500/40 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>Script de Abordagem Humanizado (WhatsApp / Direct)</span>
                </span>
                <button
                  onClick={() => handleCopyPitch(latestAi.personalizedPitch)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 transition-colors"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPitch ? 'Copiado!' : 'Copiar Script'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                {latestAi.personalizedPitch}
              </p>

              {whatsapp && (
                <div className="mt-4 pt-3 border-t border-[#1F293D] flex justify-end">
                  <a
                    href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                      latestAi.personalizedPitch
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Iniciar Conversa no WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#111827] border border-[#1F293D] text-center space-y-3">
            <Bot className="w-8 h-8 text-brand-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Nenhuma Análise de IA Gerada</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Clique no botão abaixo para a IA analisar o perfil, mapear dores comerciais e gerar um script personalizado.
            </p>
            <button
              onClick={handleRunAiAnalysis}
              disabled={analyzingAi}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors"
            >
              {analyzingAi ? 'Analisando...' : 'Executar Análise com IA'}
            </button>
          </div>
        )}

        {/* Seção 4: Gestão Comercial no Funil (CRM) & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atualização de Etapa do Funil & Proposta */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-4">
            <h3 className="font-bold text-white text-sm">Gerenciamento Comercial</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Etapa Atual no Funil (Pipeline)
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="NOVO_LEAD">1. Novo Lead</option>
                <option value="LEAD_ANALISADO">2. Lead Analisado</option>
                <option value="QUALIFICADO">3. Qualificado</option>
                <option value="AGUARDANDO_ABORDAGEM">4. Aguardando Abordagem</option>
                <option value="PRIMEIRO_CONTATO">5. Primeiro Contato Realizado</option>
                <option value="INTERESSADO">6. Interessado</option>
                <option value="REUNIAO_AGENDADA">7. Reunião / Demonstração Agendada</option>
                <option value="PROPOSTA_ENVIADA">8. Proposta Enviada</option>
                <option value="EM_NEGOCIACAO">9. Em Negociação</option>
                <option value="FECHADO_GANHO">10. Fechado - Ganho</option>
                <option value="FECHADO_PERDIDO">11. Fechado - Perdido</option>
                <option value="FOLLOW_UP_FUTURO">12. Follow-up Futuro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Valor da Proposta / Negócio (R$)
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Anotações Comerciais
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes da conversa, preferências do cliente, prazos..."
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-white focus:outline-none focus:border-brand-500 resize-none placeholder:text-gray-600"
              />
            </div>

            <button
              onClick={handleSaveStageAndNotes}
              disabled={savingLead}
              className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors"
            >
              {savingLead ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

          {/* Timeline de Atividades */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-sm">Histórico & Linha do Tempo de Atividades</h3>

            {lead.activities?.length === 0 ? (
              <p className="text-xs text-gray-500">Nenhuma atividade registrada ainda.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {lead.activities?.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] flex items-start space-x-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-white text-xs">{act.title}</h5>
                        <span className="text-[10px] text-gray-400">
                          {new Date(act.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-gray-300 mt-1 leading-relaxed text-[11px]">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
