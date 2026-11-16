# GFSites Prospect Intelligence 🚀
**Sistema Profissional de Descoberta Comercial, Diagnóstico de Presença Digital e CRM de Vendas**

Desenvolvido exclusivamente para a **GFSites & Automações**.

---

## 🎯 Objetivo Principal

A missão do **GFSites Prospect Intelligence** é encontrar diariamente oportunidades comerciais qualificadas, utilizando o Instagram como fonte inicial de descoberta, para:

1. **Identificar negócios locais e empresas que NÃO possuem site próprio** (Prioridade Absoluta).
2. **Diagnosticar a qualidade da presença digital** (diferenciando domínios próprios de agregadores como Linktree/Beacons, links de WhatsApp ou redes sociais).
3. **Calcular o Lead Score Comercial (0 a 100)** com pesos ajustáveis para priorizar abordagens.
4. **Gerar análises e scripts de abordagem humanizados com Inteligência Artificial**, mapeando as dores de cada segmento (odontologia, clínicas, estética, advocacia, gastronomia, etc.) e recomendando os serviços ideais da GFSites.
5. **Gerenciar todo o pipeline de vendas em um CRM com Kanban de 12 etapas**, timeline de atividades, propostas e rotina de follow-up.

---

## 🏗️ Arquitetura Técnica

- **Frontend & Backend**: Next.js 14+ (App Router) com TypeScript e Tailwind CSS.
- **Banco de Dados**: SQLite de alta performance local via Prisma ORM (com total compatibilidade para migração imediata para PostgreSQL / Supabase / VPS Hostinger / EasyPanel).
- **Mecanismo de Diagnóstico de Website**: Verificador ativo de domínios com detecção de agregadores, canais de mensagem, testes HTTP/HTTPS com timeout e validação de páginas em construção.
- **Lead Scoring**: Algoritmo de qualificação em 4 faixas (Prioritária 80-100, Alto Potencial 60-79, Moderado 40-59, Baixa Prioridade 0-39).
- **Integração n8n**: Webhooks com autenticação via API Key para que você conecte seus próprios fluxos do n8n facilmente (`/api/webhooks/n8n`).
- **Meta / Instagram API**: Módulo oficial de conexão OAuth, exibição de métricas da conta e importador de planilhas/CSV de seguidores.

---

## 🚀 Como Executar Localmente

### 1. Acessar o Diretório
```bash
cd C:/Users/geanf/.gemini/antigravity/scratch/gfsites-prospect-intelligence
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse em seu navegador: **[http://localhost:3001](http://localhost:3001)**

---

## 📦 Build de Produção
```bash
npm run build
npm run start
```

---

## 🔗 Endpoints de Integração & Automação (n8n)

- **Webhook de Ingestão de Leads**: `POST http://localhost:3001/api/webhooks/n8n`
- **Header de Segurança**: `X-API-Key: gfsites_secret_key_prospect_2026`
- **Payload Exemplo**:
```json
{
  "companyName": "Clínica Exemplo Odontologia",
  "username": "clinicaexemplo",
  "bio": "Implantes e estética dental em São Paulo",
  "bioLink": "https://wa.me/5511999999999",
  "whatsapp": "11999999999",
  "city": "São Paulo",
  "state": "SP"
}
```

---

*Desenvolvido por Gean Felipe — GFSites & Automações*
