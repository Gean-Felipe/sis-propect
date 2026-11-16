'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import MetricCards from '@/components/dashboard/MetricCards';
import GoldenOpportunities from '@/components/dashboard/GoldenOpportunities';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import NewLeadModal from '@/components/leads/NewLeadModal';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenLead = (id: string) => {
    router.push(`/leads/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        onOpenNewLead={() => setIsModalOpen(true)}
        title="Dashboard de Inteligência Comercial"
        subtitle="Monitoramento diário de oportunidades, presença digital e pipeline de vendas da GFSites"
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400">Carregando indicadores em tempo real...</p>
          </div>
        ) : data ? (
          <>
            {/* Cards de Métricas Principais */}
            <MetricCards metrics={data.metrics} />

            {/* Painel Especial: Oportunidades de Ouro (Empresas SEM SITE) */}
            <GoldenOpportunities
              leads={data.goldenOpportunities}
              onOpenLead={handleOpenLead}
            />

            {/* Gráficos de Diagnóstico e Segmentação */}
            <AnalyticsCharts charts={data.charts} />

            {/* Banner de Ação Rápida */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-[#111827] to-[#111827] border border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-white text-base">
                  Pronto para encontrar novos clientes hoje?
                </h3>
                <p className="text-xs text-gray-400 max-w-xl">
                  Importe planilhas de perfis do Instagram ou envie novos contatos através do seu fluxo de automação no n8n.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  href="/sources"
                  className="px-4 py-2 rounded-xl bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 transition-colors"
                >
                  Conectar Fontes & n8n
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Lead</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Não foi possível carregar os dados. Tente recarregar a página.
          </div>
        )}
      </main>

      {/* Modal de Cadastro de Lead */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={fetchStats}
      />
    </div>
  );
}
