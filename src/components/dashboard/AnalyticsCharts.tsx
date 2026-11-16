'use client';

import React from 'react';
import { PieChart, BarChart3, TrendingUp, Layers } from 'lucide-react';

interface AnalyticsChartsProps {
  charts: {
    bySegment: Record<string, number>;
    byStage: Record<string, number>;
    byWebsiteStatus: Record<string, number>;
  };
}

export default function AnalyticsCharts({ charts }: AnalyticsChartsProps) {
  const websiteStatusEntries = Object.entries(charts.byWebsiteStatus);
  const totalWebsiteClassified = websiteStatusEntries.reduce((sum, [, count]) => sum + count, 0);

  const segmentEntries = Object.entries(charts.bySegment).sort((a, b) => b[1] - a[1]);
  const totalSegments = segmentEntries.reduce((sum, [, count]) => sum + count, 0);

  // Cores semânticas para os status de website
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sem Site':
        return 'bg-red-500 text-red-400';
      case 'Site com Problemas':
        return 'bg-amber-500 text-amber-400';
      case 'Presença Fraca (Linktree)':
        return 'bg-purple-500 text-purple-400';
      case 'Site Identificado':
        return 'bg-emerald-500 text-emerald-400';
      default:
        return 'bg-cyan-500 text-cyan-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Gráfico: Classificação de Presença Digital */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <PieChart className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-white text-sm">Classificação da Presença Digital</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {totalWebsiteClassified} verificações
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Distribuição dos leads com base no diagnóstico do link da bio e checagem ativa de domínio.
          </p>

          {/* Barras Horizontais com Percentuais */}
          <div className="space-y-4">
            {websiteStatusEntries.map(([status, count]) => {
              const percentage = totalWebsiteClassified > 0 ? Math.round((count / totalWebsiteClassified) * 100) : 0;
              const colorClass = getStatusColor(status);

              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-medium">{status}</span>
                    <span className="text-gray-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1F293D] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-[11px] text-gray-400">
          <span>Amostragem em tempo real</span>
          <span className="text-brand-400 font-semibold">Prioridade em Sem Site</span>
        </div>
      </div>

      {/* 2. Gráfico: Oportunidades por Segmento */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-white text-sm">Leads por Segmento de Atuação</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {segmentEntries.length} segmentos
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Identificação inteligente de nichos comerciais com maior densidade de oportunidades.
          </p>

          <div className="space-y-3.5">
            {segmentEntries.slice(0, 5).map(([segment, count]) => {
              const percentage = totalSegments > 0 ? Math.round((count / totalSegments) * 100) : 0;

              return (
                <div key={segment}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium truncate max-w-[200px]" title={segment}>
                      {segment}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {count} leads
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1F293D] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-[11px] text-gray-400">
          <span>Detecção automática via IA</span>
          <span className="text-cyan-400 font-semibold">Segmentação Comercial</span>
        </div>
      </div>
    </div>
  );
}
