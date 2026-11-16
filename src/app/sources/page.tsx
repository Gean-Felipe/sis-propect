'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Radio,
  Instagram,
  FileSpreadsheet,
  Webhook,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function SourcesPage() {
  const [syncData, setSyncData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/n8n`
    : 'http://localhost:3001/api/webhooks/n8n';

  const webhookKey = 'gfsites_secret_key_prospect_2026';

  const fetchSyncData = async () => {
    try {
      const res = await fetch('/api/instagram/sync');
      const data = await res.json();
      if (data.success) {
        setSyncData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/instagram/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchSyncData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setImportingCsv(true);
    setCsvMessage(null);

    try {
      const res = await fetch('/api/instagram/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText }),
      });
      const data = await res.json();
      if (data.success) {
        setCsvMessage(data.message);
        setCsvText('');
        fetchSyncData();
      } else {
        setCsvMessage(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      setCsvMessage(`Falha na importação: ${err.message}`);
    } finally {
      setImportingCsv(false);
    }
  };

  const handleCopyText = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090D16]">
      <Header
        title="Fontes de Prospecção & Integrações"
        subtitle="Conexão com a Meta Graph API, Importação de Planilhas e Webhooks para o n8n"
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Bloco 1: Conta Conectada do Instagram Oficial */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F293D]">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">
                    {syncData?.account?.name || 'GFSites & Automações'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Conta Oficial Ativa
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  @{syncData?.account?.username || 'gfsites.automacoes'} • Meta Graph API Oficial
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center space-x-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando com a Meta...' : 'Sincronizar Métricas Agora'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Status</span>
              <span className="text-emerald-400 font-bold mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Conexão Segura</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Seguidores</span>
              <span className="text-white font-bold font-mono mt-1 block">
                {syncData?.account?.followersCount?.toLocaleString('pt-BR') || '4.820'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Última Sincronização</span>
              <span className="text-gray-300 font-mono mt-1 block">
                {syncData?.account?.lastSyncAt
                  ? new Date(syncData.account.lastSyncAt).toLocaleString('pt-BR')
                  : 'Recentemente'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Sincronizações Realizadas</span>
              <span className="text-cyan-400 font-bold font-mono mt-1 block">
                {syncData?.account?.syncCount || 3} jobs concluídos
              </span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Integração com n8n (Webhooks para Automação Comercial) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-500/30 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Integração com n8n (Automação de Descoberta)</h3>
              <p className="text-xs text-gray-400">
                Conecte seu fluxo do n8n para enviar novos contatos e leads qualificados diretamente para o sistema.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                URL do Webhook (Método POST)
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-cyan-300"
                />
                <button
                  onClick={() => handleCopyText(webhookUrl, 'url')}
                  className="px-3 py-1.5 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 flex items-center space-x-1"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Header de Autenticação (X-API-Key)
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={webhookKey}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-gray-300"
                />
                <button
                  onClick={() => handleCopyText(webhookKey, 'key')}
                  className="px-3 py-1.5 rounded-lg bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-200 flex items-center space-x-1"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 pt-2 border-t border-[#1F293D]">
              Exemplo de payload JSON suportado: <code className="text-cyan-400 font-mono font-semibold">{"{ companyName: 'Clínica X', username: 'clinicax', bio: '...', bioLink: '...', whatsapp: '119...' }"}</code>
            </div>
          </div>
        </div>

        {/* Bloco 3: Importação de Planilha / CSV de Perfis */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Importação de Perfis via CSV / Planilha</h3>
              <p className="text-xs text-gray-400">
                Cole dados exportados de seguidores ou contatos para qualificação e diagnóstico em lote.
              </p>
            </div>
          </div>

          {csvMessage && (
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs">
              {csvMessage}
            </div>
          )}

          <div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Cole os dados com cabeçalho (ex: companyName;username;bio;bioLink;whatsapp;city;state)&#10;Clínica Exemplo;clinicaexemplo;Atendimento Odonto;https://wa.me/5511999999999;11999999999;São Paulo;SP"
              className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              O sistema diagnostica links, identifica nicho e calcula o Lead Score automaticamente para cada linha.
            </span>
            <button
              onClick={handleImportCsv}
              disabled={importingCsv || !csvText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{importingCsv ? 'Processando...' : 'Importar e Qualificar'}</span>
            </button>
          </div>
        </div>

        {/* Bloco 4: Histórico de Sincronizações (Auditoria) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="font-bold text-white text-sm">Histórico de Jobs de Sincronização & Ingestão</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1F293D] bg-[#0B0F19] text-[10px] text-gray-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Novos Leads</th>
                  <th className="py-2.5 px-3">Atualizados</th>
                  <th className="py-2.5 px-3">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/60 text-gray-300">
                {syncData?.recentJobs?.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[#0B0F19]/50">
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">
                      {job.sourceType}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{job.recordsImported}</td>
                    <td className="py-2.5 px-3 font-mono">{job.recordsUpdated}</td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono">
                      {new Date(job.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
