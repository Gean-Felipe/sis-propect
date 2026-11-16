'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import {
  CalendarCheck,
  Flame,
  MessageCircle,
  ExternalLink,
  Zap,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Bot,
} from 'lucide-react';

export default function RoutinePage() {
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoutine = async () => {
    try {
      const res = await fetch('/api/routine');
      const data = await res.json();
      if (data.success) {
        setRoutine(data.routine);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        title="Minha Rotina Comercial Diária"
        subtitle="Acompanhamento de abordagens, follow-ups e retorno de propostas"
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : routine ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco 1: Leads Prioritários para Abordar Hoje */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-red-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                      <Flame className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-white text-base">Leads para Abordar Hoje</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                    {routine.toApproachToday?.length || 0} pendentes
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Empresas prioritárias (Score 70+) com Instagram comercial ativo que ainda não possuem site.
                </p>

                <div className="space-y-3">
                  {routine.toApproachToday?.map((lead: any) => {
                    const whatsapp = lead.contacts?.find((c: any) => c.type === 'WHATSAPP')?.value;

                    return (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] flex items-center justify-between hover:border-red-500/40 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-white text-xs hover:text-brand-400 truncate block"
                          >
                            {lead.companyName}
                          </Link>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5">
                            <span className="text-cyan-400">@{lead.username}</span>
                            <span>•</span>
                            <span>{lead.segment}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                            {lead.leadScore} pts
                          </span>

                          {whatsapp && (
                            <a
                              href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              title="Enviar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-1.5 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-gray-300 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F293D] text-[11px] text-gray-400">
                Dica: Inicie a conversa citando um ponto positivo do Instagram da empresa.
              </div>
            </div>

            {/* Bloco 2: Respostas Aguardadas & Follow-up */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Clock className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-white text-base">Respostas Aguardadas & Contato</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F293D] text-cyan-300">
                    {routine.awaitingResponse?.length || 0} contatos
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Contatos em que a mensagem de abordagem inicial já foi enviada ou em negociação.
                </p>

                <div className="space-y-3">
                  {routine.awaitingResponse?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Nenhum contato aguardando resposta no momento.
                    </div>
                  ) : (
                    routine.awaitingResponse?.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] flex items-center justify-between hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-white text-xs hover:text-brand-400 truncate block"
                          >
                            {lead.companyName}
                          </Link>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Etapa: {lead.pipelineStage.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <Link
                          href={`/leads/${lead.id}`}
                          className="px-3 py-1 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 transition-colors"
                        >
                          Registrar Resposta
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F293D] text-[11px] text-gray-400">
                Se não responder após 48h, envie uma mensagem de lembrete com valor agregado.
              </div>
            </div>

            {/* Bloco 3: Propostas Enviadas Aguardando Fechamento */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Send className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-white text-base">
                    Propostas Enviadas que Precisam de Retorno
                  </h3>
                </div>
                <span className="text-xs text-gray-400">
                  {routine.pendingProposals?.length || 0} propostas em análise
                </span>
              </div>

              {routine.pendingProposals?.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 bg-[#0B0F19] rounded-xl border border-[#1F293D]">
                  Nenhuma proposta com retorno pendente hoje. Avance leads interessados para a etapa de proposta.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routine.pendingProposals?.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-white text-xs">{lead.companyName}</h4>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold block mt-0.5">
                          Valor: R$ {lead.dealValue?.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <Link
                        href={`/leads/${lead.id}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-colors"
                      >
                        Fazer Follow-up
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
