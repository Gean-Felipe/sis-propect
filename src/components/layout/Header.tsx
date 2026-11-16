'use client';

import React, { useState } from 'react';
import { Search, Plus, Bell, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenNewLead?: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({
  onOpenNewLead,
  title = 'GFSites Prospect Intelligence',
  subtitle = 'Plataforma Estratégica de Prospecção e Inteligência Comercial'
}: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleQuickSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback('Sincronizado!');
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } catch {
      // Ignora erro visual transitório
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Título da Página ou Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{title}</span>
        </h1>
        <p className="text-xs text-gray-400 font-normal">{subtitle}</p>
      </div>

      {/* Ações do Header */}
      <div className="flex items-center space-x-3">
        {/* Botão Sincronizar Rápido */}
        <button
          onClick={handleQuickSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
          title="Sincronizar métricas oficiais da conta Meta"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : 'text-gray-400'}`} />
          <span>{syncFeedback || (isSyncing ? 'Sincronizando...' : 'Sincronizar')}</span>
        </button>

        {/* Botão Adicionar Lead */}
        {onOpenNewLead && (
          <button
            onClick={onOpenNewLead}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-500 text-white text-xs font-semibold hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        )}

        {/* Separador */}
        <div className="h-6 w-[1px] bg-[#1F293D]" />

        {/* Perfil Gean Felipe */}
        <div className="flex items-center space-x-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-500/30">
            GF
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Gean Felipe</p>
            <p className="text-[10px] text-gray-400 leading-tight">Diretoria Comercial</p>
          </div>
        </div>
      </div>
    </header>
  );
}
