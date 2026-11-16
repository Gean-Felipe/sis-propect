'use client';

import React, { useState } from 'react';
import { X, Sparkles, Building, Globe, MessageCircle, MapPin, Tag, Plus, CheckCircle2 } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
}

export default function NewLeadModal({ isOpen, onClose, onLeadCreated }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    tradeName: '',
    username: '',
    bio: '',
    bioLink: '',
    segment: 'Não identificado',
    city: '',
    state: '',
    whatsapp: '',
    phone: '',
    email: '',
    followersCount: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao cadastrar lead.');
      }

      setSuccessResult(data);
      if (onLeadCreated) onLeadCreated();

      // Reset form após 1.5s
      setTimeout(() => {
        setSuccessResult(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-[#1F293D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1F293D]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cadastrar Novo Potencial Cliente</h3>
              <p className="text-xs text-gray-400">
                O sistema executará o diagnóstico de website e cálculo de score automaticamente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F293D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {successResult ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Lead Cadastrado com Sucesso!</h4>
            <div className="text-xs text-gray-300">
              <p>Diagnóstico: <strong className="text-white">{successResult.websiteDiag.resultStatus}</strong></p>
              <p>Score: <strong className="text-emerald-400">{successResult.scoreResult.totalScore} pts</strong> ({successResult.scoreResult.tier})</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Linha 1: Nome da Empresa e @username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome da Empresa / Negócio *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="Ex: Clínica Sorriso Perfeito"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  @ Perfil do Instagram *
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Ex: @sorrisoperfeitoodonto"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Linha 2: Link da Bio e Segmento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link na Bio do Instagram
                </label>
                <input
                  type="text"
                  name="bioLink"
                  placeholder="Ex: linktr.ee/clinica ou wa.me/..."
                  value={formData.bioLink}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1">Se estiver vazio, será diagnosticado como Sem Site.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Segmento de Atuação
                </label>
                <select
                  name="segment"
                  value={formData.segment}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="Não identificado">Identificar Automaticamente com IA</option>
                  <option value="Clínica odontológica">Clínica odontológica</option>
                  <option value="Clínica médica">Clínica médica</option>
                  <option value="Psicologia">Psicologia</option>
                  <option value="Oftalmologia">Oftalmologia</option>
                  <option value="Estética e Bem-estar">Estética e Bem-estar</option>
                  <option value="Barbearia">Barbearia</option>
                  <option value="Salão de beleza">Salão de beleza</option>
                  <option value="Academia e Fitness">Academia e Fitness</option>
                  <option value="Restaurante e Gastronomia">Restaurante e Gastronomia</option>
                  <option value="Cafeteria e Confeitaria">Cafeteria e Confeitaria</option>
                  <option value="Petshop e Veterinária">Petshop e Veterinária</option>
                  <option value="Imobiliária e Corretores">Imobiliária e Corretores</option>
                  <option value="Escritório de advocacia">Escritório de advocacia</option>
                </select>
              </div>
            </div>

            {/* Linha 3: WhatsApp e Cidade/Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp Comercial
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  placeholder="Ex: 11998765432"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ex: São Paulo"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs uppercase placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Linha 4: Biografia do Instagram */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Texto da Biografia (Bio)
              </label>
              <textarea
                name="bio"
                rows={2}
                placeholder="Cole a biografia do perfil para enriquecimento e análise da IA..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            {/* Rodapé com Botões */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1F293D]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1F293D] hover:bg-[#374151] text-xs font-semibold text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                {loading ? 'Diagnosticando & Salvando...' : 'Qualificar e Salvar Lead'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
