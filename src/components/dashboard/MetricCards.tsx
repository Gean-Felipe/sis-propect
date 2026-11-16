'use client';

import React from 'react';
import {
  Globe,
  AlertTriangle,
  Zap,
  Send,
  DollarSign,
  TrendingUp,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface MetricCardsProps {
  metrics: {
    totalLeads: number;
    leadsWithoutSite: number;
    leadsBrokenSite: number;
    leadsWeakPresence: number;
    leadsWithSite: number;
    priorityLeads: number;
    highPotentialLeads: number;
    leadsContacted: number;
    leadsInterested: number;
    proposalsSent: number;
    dealsWon: number;
    dealsLost: number;
    conversionRate: number;
    totalPotentialRevenue: number;
    closedRevenue: number;
  };
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Card Chave: SEM SITE (Prioridade Absoluta) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-[#111827] to-[#111827] border border-red-500/30 glass-card-hover relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Foco Comercial
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white">{metrics.leadsWithoutSite}</span>
          <span className="text-xs font-medium text-red-400">empresas sem site</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Prioridade máxima: leads com atividade comercial sem presença no Google.
        </p>
      </div>

      {/* 2. Oportunidades Prioritárias (Score 80+) */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F293D] glass-card-hover relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Score Alto (80-100)
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white">{metrics.priorityLeads}</span>
          <span className="text-xs font-medium text-gray-400">leads prioritários</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          {metrics.highPotentialLeads} leads adicionais com potencial moderado/alto.
        </p>
      </div>

      {/* 3. Site com Problemas / Linktree */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F293D] glass-card-hover relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Presença Frágil
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white">
            {metrics.leadsBrokenSite + metrics.leadsWeakPresence}
          </span>
          <span className="text-xs font-medium text-amber-400/90">sites instáveis ou bio genérica</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          {metrics.leadsBrokenSite} sites com erro técnico e {metrics.leadsWeakPresence} em agregadores.
        </p>
      </div>

      {/* 4. Receita Fechada & Pipeline */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#111827] to-[#111827] border border-emerald-500/20 glass-card-hover relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Resultado Comercial
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-emerald-400">
            {formatCurrency(metrics.closedRevenue)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
          <span>Potencial: {formatCurrency(metrics.totalPotentialRevenue)}</span>
          <span className="font-semibold text-emerald-400">{metrics.dealsWon} fechados</span>
        </div>
      </div>
    </div>
  );
}
