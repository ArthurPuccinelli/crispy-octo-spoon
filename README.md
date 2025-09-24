# 🍜 Crispy Octo Spoon

Aplicação moderna com **Next.js** (React + TypeScript) no frontend e backend servido via **Netlify Functions** (serverless). O antigo backend Express foi removido.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linter para qualidade de código

### Serverless Backend
- **Netlify Functions** - APIs (DocuSign DataIO, Clientes, JWT, etc.)
- **Supabase JS** - Persistência de dados

## 📁 Estrutura do Projeto

```
crispy-octo-spoon/
├── frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/       # App Router do Next.js
│   │   ├── components/# Componentes React
│   │   └── lib/       # Utilitários e configurações
│   ├── public/        # Arquivos estáticos
│   └── package.json
├── frontend/.netlify/functions/  # Funções serverless (APIs)
└── package.json       # Scripts principais
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos
1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd crispy-octo-spoon
   ```

2. **Instale todas as dependências**
   ```bash
   npm run install:all
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Opção 1: Script automático (recomendado)
   ./setup-local-env.sh
   
   # Opção 2: Manual
   cd frontend
   cp env.local.template .env.local
   # Edite .env.local com suas configurações
   ```
   
   📚 **Documentação completa**: [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md)

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev:frontend
```

### Produção
```bash
npm run build    # Build do frontend
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **APIs (serverless)**: `/.netlify/functions/*` (via Netlify Dev/Deploy)
- DocuSign Maestro env vars (in Netlify): `DOCUSIGN_BASE_PATH`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_PRIVATE_KEY`, `DOCUSIGN_REDIRECT_URI`, `DOCUSIGN_MAESTRO_WORKFLOW_EMPRESTIMOS_ID`

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o frontend
- `npm run build` - Build de produção do frontend
- `npm run start` - Inicia o frontend em produção
- `npm run install:all` - Instala dependências (root + frontend)
- `npm run clean` - Remove node_modules (root + frontend)

## 🔧 Desenvolvimento

### Frontend
- Edite arquivos em `frontend/src/`
- O Next.js recarrega automaticamente
- Tailwind CSS está configurado e funcionando

### Funções Netlify
- Edite arquivos em `frontend/.netlify/functions/*`
- Use `netlify dev` em `frontend/.netlify/functions` para testar localmente
