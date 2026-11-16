'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Briefcase,
  Globe,
  Bot,
  Zap,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'WEBSITES':
        return <Globe className="w-4 h-4 text-brand-400" />;
      case 'AUTOMATION':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'AI_AGENTS':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'WEBSITES':
        return 'Desenvolvimento de Sites';
      case 'AUTOMATION':
        return 'Automações & WhatsApp';
      case 'AI_AGENTS':
        return 'Inteligência Artificial';
      default:
        return cat;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        title="Catálogo de Soluções & Serviços GFSites"
        subtitle="Portfólio comercial, precificação sugerida, prazos e argumentos de venda"
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Filtros de Categoria */}
        <div className="flex items-center space-x-2 pb-2">
          {['ALL', 'WEBSITES', 'AUTOMATION', 'AI_AGENTS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-[#1F293D]'
              }`}
            >
              {cat === 'ALL' ? 'Todos os Serviços' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Grid de Serviços */}
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] hover:border-brand-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Categoria Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F19] text-xs font-semibold border border-[#1F293D]">
                      {getCategoryIcon(service.category)}
                      <span className="text-gray-300">{getCategoryLabel(service.category)}</span>
                    </span>

                    <span className="text-xs text-gray-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{service.estimatedDays} dias</span>
                    </span>
                  </div>

                  {/* Título & Descrição */}
                  <h3 className="font-bold text-white text-base mb-2 group-hover:text-brand-400 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Benefícios */}
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] mb-4 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                      Entregáveis & Benefícios
                    </span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {service.benefits}
                    </p>
                  </div>

                  {/* Argumentos Comerciais de Venda */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-950/20 to-transparent border border-brand-500/20 mb-4 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 flex items-center space-x-1 mb-1">
                      <Sparkles className="w-3 h-3 text-brand-400" />
                      <span>Argumento de Conversão</span>
                    </span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {service.salesArguments}
                    </p>
                  </div>
                </div>

                {/* Preço e Público-Alvo */}
                <div className="pt-4 border-t border-[#1F293D] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      A partir de
                    </span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      R$ {service.startingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 max-w-[140px] text-right truncate" title={service.targetAudience}>
                    {service.targetAudience}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
