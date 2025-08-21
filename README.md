# 🍜 Crispy Octo Spoon

Aplicação full-stack moderna construída com **Next.js** (React + TypeScript) no frontend e **Node.js** (Express) no backend.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linter para qualidade de código

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Cross-origin resource sharing
- **Helmet** - Segurança HTTP
- **Morgan** - Logger de requisições
- **Nodemon** - Reinicialização automática em desenvolvimento

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
├── backend/           # API Node.js
│   ├── src/
│   │   ├── routes/    # Rotas da API
│   │   ├── controllers/# Controladores
│   │   └── middleware/# Middlewares
│   └── package.json
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
   # Backend
   cp backend/env.example backend/.env
   # Edite backend/.env conforme necessário
   ```

## 🚀 Executando o Projeto

### Desenvolvimento (Frontend + Backend)
```bash
npm run dev
```

### Apenas Frontend
```bash
npm run dev:frontend
```

### Apenas Backend
```bash
npm run dev:backend
```

### Produção
```bash
npm run build    # Build do frontend
npm start        # Inicia o backend
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Clientes**: http://localhost:3001/api/clientes

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em desenvolvimento
- `npm run dev:frontend` - Inicia apenas o frontend
- `npm run dev:backend` - Inicia apenas o backend
- `npm run build` - Build de produção do frontend
- `npm run start` - Inicia o backend em produção
- `npm run install:all` - Instala dependências de todos os projetos
- `npm run clean` - Remove node_modules de todos os projetos

## 🔧 Desenvolvimento

### Frontend
- Edite arquivos em `frontend/src/`
- O Next.js recarrega automaticamente
- Tailwind CSS está configurado e funcionando

### Backend
- Edite arquivos em `backend/src/`
- Nodemon reinicia automaticamente
- API REST disponível em `/api/*`

## 📚 Próximos Passos

- [ ] Integração com banco de dados (Supabase/PostgreSQL)
- [ ] Autenticação JWT
- [ ] Upload de arquivos
- [ ] Testes automatizados
- [ ] Docker para desenvolvimento
- [ ] CI/CD pipeline

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.