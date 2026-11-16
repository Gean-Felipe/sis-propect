'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import {
  Kanban as KanbanIcon,
  RefreshCw,
  Plus,
  Flame,
  Globe,
  AlertTriangle,
  Zap,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'NOVO_LEAD', label: '1. Novo Lead', color: 'border-blue-500/30' },
  { key: 'LEAD_ANALISADO', label: '2. Analisado', color: 'border-cyan-500/30' },
  { key: 'QUALIFICADO', label: '3. Qualificado', color: 'border-teal-500/30' },
  { key: 'AGUARDANDO_ABORDAGEM', label: '4. Aguardando Contato', color: 'border-indigo-500/30' },
  { key: 'PRIMEIRO_CONTATO', label: '5. Primeiro Contato', color: 'border-sky-500/30' },
  { key: 'INTERESSADO', label: '6. Interessado', color: 'border-amber-500/30' },
  { key: 'REUNIAO_AGENDADA', label: '7. Reunião Agendada', color: 'border-purple-500/30' },
  { key: 'PROPOSTA_ENVIADA', label: '8. Proposta Enviada', color: 'border-violet-500/30' },
  { key: 'EM_NEGOCIACAO', label: '9. Em Negociação', color: 'border-pink-500/30' },
  { key: 'FECHADO_GANHO', label: '10. Fechado Ganho', color: 'border-emerald-500/50' },
  { key: 'FECHADO_PERDIDO', label: '11. Perdido', color: 'border-red-500/30' },
  { key: 'FOLLOW_UP_FUTURO', label: '12. Follow-up Futuro', color: 'border-gray-500/30' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSegment, setFilterSegment] = useState('ALL');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (leadId: string, newStage: string) => {
    // Atualização otimista
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: newStage } : l))
    );

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
    } catch (err) {
      console.error('Erro ao mover lead:', err);
      fetchLeads();
    }
  };

  const filteredLeads = filterSegment === 'ALL'
    ? leads
    : leads.filter((l) => l.segment === filterSegment);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090D16] min-w-0">
      <Header
        title="Funil Comercial (CRM Kanban)"
        subtitle="Gerenciamento do ciclo de vendas em 12 etapas com drag and drop"
      />

      {/* Barra de Controles e Filtros */}
      <div className="px-6 py-3 border-b border-[#1F293D] bg-[#0B0F19] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-gray-400">Filtrar por Nicho:</span>
          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F293D] text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">Todos os Segmentos</option>
            <option value="Clínica odontológica">Clínica odontológica</option>
            <option value="Clínica médica">Clínica médica</option>
            <option value="Estética e Bem-estar">Estética e Bem-estar</option>
            <option value="Restaurante e Gastronomia">Restaurante e Gastronomia</option>
            <option value="Escritório de advocacia">Escritório de advocacia</option>
            <option value="Imobiliária e Corretores">Imobiliária e Corretores</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          <span>Total no Funil: </span>
          <strong className="text-white font-mono">{filteredLeads.length} leads</strong>
        </div>
      </div>

      {/* Área Kanban com Scroll Horizontal */}
      <div className="flex-1 p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="flex space-x-4 min-w-[3200px] pb-6">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.pipelineStage === stage.key);
              const totalStageValue = stageLeads.reduce((sum, l) => sum + (l.dealValue || 1800), 0);

              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLeadId) {
                      handleStageChange(draggedLeadId, stage.key);
                      setDraggedLeadId(null);
                    }
                  }}
                  className={`w-72 rounded-2xl bg-[#111827]/70 border ${stage.color} flex flex-col max-h-[calc(100vh-210px)] shrink-0`}
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="p-3.5 border-b border-[#1F293D] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs tracking-tight">{stage.label}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatCurrency(totalStageValue)}
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-[#1F293D] text-[11px] font-bold text-cyan-400 flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Lista de Cards da Etapa */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-[#1F293D] text-center text-[11px] text-gray-400">
                        Nenhum lead nesta etapa
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => setDraggedLeadId(lead.id)}
                          className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] hover:border-brand-500/50 cursor-grab active:cursor-grabbing transition-all space-y-2 group shadow-sm hover:shadow-md"
                        >
                          {/* Nome e Link */}
                          <div className="flex items-start justify-between gap-1">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-bold text-white text-xs hover:text-brand-400 transition-colors truncate max-w-[170px]"
                              title={lead.companyName}
                            >
                              {lead.companyName}
                            </Link>

                            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                              <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                              <span>{lead.leadScore}</span>
                            </div>
                          </div>

                          {/* @username & nicho */}
                          <div className="text-[11px] text-gray-400 flex items-center justify-between">
                            <span className="text-cyan-400 font-mono truncate max-w-[120px]">
                              @{lead.username}
                            </span>
                            <span className="text-gray-400 text-[10px]">{lead.segment}</span>
                          </div>

                          {/* Badge de Website (Prioridade em Sem Site) */}
                          <div>
                            {lead.websiteStatus === 'SEM SITE' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                <Flame className="w-2.5 h-2.5" />
                                <span>SEM SITE</span>
                              </span>
                            ) : lead.websiteStatus === 'SITE COM PROBLEMAS' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Site Instável</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1F293D] text-gray-300">
                                <Globe className="w-2.5 h-2.5" />
                                <span>{lead.websiteStatus}</span>
                              </span>
                            )}
                          </div>

                          {/* Rodapé com Valor Estimado e Ação */}
                          <div className="pt-2 border-t border-[#1F293D]/60 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-400 font-mono">
                              {formatCurrency(lead.dealValue || 1800)}
                            </span>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="text-brand-400 hover:text-brand-300 text-[10px] font-semibold flex items-center space-x-0.5"
                            >
                              <span>Abrir</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
