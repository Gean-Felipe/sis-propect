'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarCheck,
  Radio,
  Briefcase,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Instagram,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Leads & Prospecção',
    href: '/leads',
    icon: Users,
    badge: 'Prioritários',
  },
  {
    label: 'Funil Comercial (CRM)',
    href: '/pipeline',
    icon: Kanban,
    badge: null,
  },
  {
    label: 'Minha Rotina',
    href: '/routine',
    icon: CalendarCheck,
    badge: 'Hoje',
  },
  {
    label: 'Fontes de Prospecção',
    href: '/sources',
    icon: Radio,
    badge: 'Meta / n8n',
  },
  {
    label: 'Catálogo de Serviços',
    href: '/services',
    icon: Briefcase,
    badge: null,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-[#1F293D] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-black text-xl">
            GF
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">GFSites</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 tracking-wide font-medium">Prospect Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Módulos Principais
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#1F293D] text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Critério Chave / Alerta de Prioridade */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20">
        <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Foco Estratégico</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Prioridade máxima para empresas <strong className="text-red-300 font-semibold">Sem Site</strong> identificadas no Instagram.
        </p>
      </div>

      {/* Status da Conexão Meta & Versão */}
      <div className="p-4 border-t border-[#1F293D] bg-[#0A0D15]/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300 font-medium">Meta API Oficial</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
            Conectado
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>GFSites & Automações</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
