'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  MessageCircle,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Bot,
  MapPin,
  Users,
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  tradeName?: string | null;
  username: string;
  bio?: string | null;
  segment: string;
  followersCount?: number | null;
  city?: string | null;
  state?: string | null;
  leadScore: number;
  scoreTier: string;
  pipelineStage: string;
  contacts?: Array<{ type: string; value: string }>;
}

interface GoldenOpportunitiesProps {
  leads: Lead[];
  onOpenLead: (id: string) => void;
}

export default function GoldenOpportunities({ leads, onOpenLead }: GoldenOpportunitiesProps) {
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [activePitch, setActivePitch] = useState<{ id: string; pitch: string; company: string; whatsapp?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGeneratePitch = async (lead: Lead) => {
    setLoadingAiId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/ai-analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.analysis) {
        const whatsapp = lead.contacts?.find(c => c.type === 'WHATSAPP')?.value;
        setActivePitch({
          id: lead.id,
          pitch: data.analysis.personalizedPitch,
          company: lead.companyName,
          whatsapp,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiId(null);
    }
  };

  const handleCopyPitch = () => {
    if (!activePitch) return;
    navigator.clipboard.writeText(activePitch.pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Glow de Fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-brand-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Oportunidades de Ouro (Empresas Sem Site)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
              Top Prioridade
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Os 10 melhores potenciais clientes com Instagram comercial ativo que ainda não possuem site profissional.
          </p>
        </div>

        <Link
          href="/leads?websiteStatus=SEM%20SITE"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 transition-colors"
        >
          <span>Ver todas as oportunidades</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Oportunidades */}
      {leads.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-xs">
          Nenhuma empresa sem site encontrada no momento. Importe mais perfis para identificar oportunidades.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead, idx) => {
            const whatsapp = lead.contacts?.find((c) => c.type === 'WHATSAPP')?.value;
            const location = [lead.city, lead.state].filter(Boolean).join(', ');

            return (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-[#0B0F19]/90 border border-[#1F293D] hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar do Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#1F293D] text-[10px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <h3
                        onClick={() => onOpenLead(lead.id)}
                        className="font-bold text-white text-sm hover:text-brand-400 cursor-pointer truncate transition-colors"
                        title={lead.companyName}
                      >
                        {lead.companyName}
                      </h3>
                    </div>

                    {/* Lead Score Badge */}
                    <div className="flex items-center space-x-1 shrink-0 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      <Zap className="w-3 h-3 fill-emerald-400" />
                      <span>{lead.leadScore} pts</span>
                    </div>
                  </div>

                  {/* Informações Complementares */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-3">
                    <a
                      href={`https://instagram.com/${lead.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>@{lead.username}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <span className="text-gray-600">•</span>
                    <span className="text-gray-300 font-medium">{lead.segment}</span>

                    {lead.followersCount ? (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center space-x-1 text-gray-400">
                          <Users className="w-3 h-3" />
                          <span>{lead.followersCount.toLocaleString('pt-BR')} seg</span>
                        </span>
                      </>
                    ) : null}

                    {location && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center space-x-1 text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{location}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Diagnóstico Resumido */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 mb-3 flex items-center justify-between">
                    <span className="font-medium">Status: SEM SITE IDENTIFICADO</span>
                    <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">
                      Urgência Alta
                    </span>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1F293D]/60">
                  <button
                    onClick={() => handleGeneratePitch(lead)}
                    disabled={loadingAiId === lead.id}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-colors"
                  >
                    <Bot className={`w-3.5 h-3.5 ${loadingAiId === lead.id ? 'animate-spin' : ''}`} />
                    <span>{loadingAiId === lead.id ? 'Analisando...' : 'Gerar Abordagem IA'}</span>
                  </button>

                  {whatsapp ? (
                    <a
                      href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá! Tudo bem? Me chamo Gean, responsável pela GFSites & Automações. Conheci a ${lead.companyName} pelo Instagram e gostaria de apresentar uma oportunidade.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => onOpenLead(lead.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-gray-300 text-xs font-medium transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Gaveta de Pitch Gerado com IA */}
      {activePitch && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F293D] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Abordagem Personalizada com IA</h4>
                  <p className="text-[11px] text-gray-400">{activePitch.company}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePitch(null)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs text-gray-200 leading-relaxed font-sans mb-4 whitespace-pre-wrap">
              {activePitch.pitch}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCopyPitch}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1F293D] hover:bg-[#374151] text-gray-200 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Mensagem'}</span>
              </button>

              {activePitch.whatsapp && (
                <a
                  href={`https://wa.me/55${activePitch.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    activePitch.pitch
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
