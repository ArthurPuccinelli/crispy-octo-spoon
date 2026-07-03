# Graph Report - crispy-octo-spoon  (2026-07-03)

## Corpus Check
- 77 files · ~45,174 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 385 nodes · 490 edges · 39 communities (27 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78371e9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_AuthContext.tsx|AuthContext.tsx]]
- [[_COMMUNITY_What You Must Do When Invoked|What You Must Do When Invoked]]
- [[_COMMUNITY_ThemeContext.tsx|ThemeContext.tsx]]
- [[_COMMUNITY_bankSession.ts|bankSession.ts]]
- [[_COMMUNITY_graphify|/graphify]]
- [[_COMMUNITY_maestro.js|maestro.js]]
- [[_COMMUNITY_MaestroDemo.tsx|MaestroDemo.tsx]]
- [[_COMMUNITY_graphify reference extra exports and benchmark|graphify reference: extra exports and benchmark]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_graphify reference query, path, explain|graphify reference: query, path, explain]]
- [[_COMMUNITY_graphify reference add a URL and watch a folder|graphify reference: add a URL and watch a folder]]
- [[_COMMUNITY_graphify reference commit hook and native CLAUDE.md integration|graphify reference: commit hook and native CLAUDE.md integration]]
- [[_COMMUNITY_graphify reference incremental update and cluster-only|graphify reference: incremental update and cluster-only]]
- [[_COMMUNITY_graphify reference GitHub clone and cross-repo merge|graphify reference: GitHub clone and cross-repo merge]]
- [[_COMMUNITY_graphify reference transcribe video and audio|graphify reference: transcribe video and audio]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_extraction-spec|extraction-spec.md]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AdminNavBar.tsx|AdminNavBar.tsx]]
- [[_COMMUNITY_docusign-actions.js|docusign-actions.js]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_common.tsx|common.tsx]]
- [[_COMMUNITY_eslint.config.mjs|eslint.config.mjs]]
- [[_COMMUNITY_CreateRecord.js|CreateRecord.js]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_PatchRecord.js|PatchRecord.js]]
- [[_COMMUNITY_GetTypeDefinitions.js|GetTypeDefinitions.js]]
- [[_COMMUNITY_SearchRecords.js|SearchRecords.js]]
- [[_COMMUNITY_supabase-keepalive.mjs|supabase-keepalive.mjs]]
- [[_COMMUNITY_verify.js|verify.js]]
- [[_COMMUNITY_next.config.mjs|next.config.mjs]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `What You Must Do When Invoked` - 12 edges
3. `useAuth()` - 11 edges
4. `supabase` - 11 edges
5. `/graphify` - 10 edges
6. `handler()` - 9 edges
7. `useMaestroDemo()` - 8 edges
8. `Cliente` - 8 edges
9. `graphify reference: extra exports and benchmark` - 8 edges
10. `🍜 Crispy Octo Spoon` - 8 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/layout.tsx → frontend/src/contexts/AuthContext.tsx
- `AdminDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/page.tsx → frontend/src/contexts/AuthContext.tsx
- `GestaoProdutosPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/app/admin/produtos/page.tsx → frontend/src/contexts/AuthContext.tsx
- `AssinaturasPage()` --calls--> `useAdvancedSignatureDemo()`  [EXTRACTED]
  frontend/src/app/conta/assinaturas/page.tsx → frontend/src/components/docusign/AdvancedSignatureDemo.tsx
- `ContaLayout()` --calls--> `firstName()`  [EXTRACTED]
  frontend/src/app/conta/layout.tsx → frontend/src/lib/bankSession.ts

## Import Cycles
- None detected.

## Communities (39 total, 12 thin omitted)

### Community 0 - "page.tsx"
Cohesion: 0.09
Nodes (31): AssinaturasPage(), DOCUMENTOS, CartoesPage(), EmprestimosPage(), fmtBRL(), ContaLayout(), NAV_ITEMS, ContaDashboard() (+23 more)

### Community 1 - "AuthContext.tsx"
Cohesion: 0.13
Nodes (15): AdminLayout(), AdminDashboard(), DashboardStats, GestaoProdutosPage(), Produto, inter, metadata, LoginPage() (+7 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 3 - "ThemeContext.tsx"
Cohesion: 0.26
Nodes (10): TemaPage(), StoredTheme, ThemeContext, ThemeContextType, useTheme(), applyTheme(), hexToRgbTriplet(), Theme (+2 more)

### Community 4 - "bankSession.ts"
Cohesion: 0.14
Nodes (14): Contrato, DashboardStats(), ClienteFormData, ClienteFormProps, Produto, ProdutoFormProps, useClientes(), useProdutos() (+6 more)

### Community 5 - "/graphify"
Cohesion: 0.07
Nodes (26): dependencies, jsonwebtoken, next, react, react-dom, @supabase/supabase-js, devDependencies, autoprefixer (+18 more)

### Community 6 - "maestro.js"
Cohesion: 0.38
Nodes (9): axios, CORS_HEADERS, docusign, getEnv(), getJwtToken(), handler(), json(), maestroFetch() (+1 more)

### Community 7 - "MaestroDemo.tsx"
Cohesion: 0.08
Nodes (24): author, dependencies, cors, docusign-esign, dotenv, express, helmet, morgan (+16 more)

### Community 8 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 9 - "page.tsx"
Cohesion: 0.29
Nodes (5): AuditEvent, AuditEventsResponse, IDEvidenceEvent, IDEvidenceMedia, IDEvidenceResponse

### Community 10 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 11 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 12 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 13 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 21 - "layout.tsx"
Cohesion: 0.12
Nodes (8): DataTableProps, PageContainerProps, PageHeaderProps, TableActionsCellProps, TableBodyProps, TableCellProps, TableColumnHeaderProps, TableHeaderProps

### Community 22 - "AdminNavBar.tsx"
Cohesion: 0.12
Nodes (16): 🍜 Crispy Octo Spoon, Desenvolvimento, 🔧 Desenvolvimento, 📁 Estrutura do Projeto, 🚀 Executando o Projeto, Frontend, Frontend, Funções Netlify (+8 more)

### Community 23 - "docusign-actions.js"
Cohesion: 0.25
Nodes (15): CORS_HEADERS, createEmbeddedEnvelope(), createEnvelope(), docusign, generateCartaoTermo(), getAllIDEvidenceData(), getEnv(), getEnvelopeAuditEvents() (+7 more)

### Community 24 - "package.json"
Cohesion: 0.12
Nodes (15): author, description, devDependencies, concurrently, keywords, license, main, name (+7 more)

### Community 25 - "common.tsx"
Cohesion: 0.25
Nodes (3): EmptyStateProps, ErrorMessageProps, StatusBadgeProps

### Community 26 - "eslint.config.mjs"
Cohesion: 0.29
Nodes (5): compat, __dirname, eslintConfig, __filename, extends

### Community 27 - "CreateRecord.js"
Cohesion: 0.50
Nodes (4): { createClient }, handler(), idemCache, isUuidV4()

### Community 28 - "README.md"
Cohesion: 0.40
Nodes (4): Deploy on Vercel, Getting Started, Learn More, Local environment variables

## Knowledge Gaps
- **183 isolated node(s):** `extends`, `{ createClient }`, `idemCache`, `{ createClient }`, `idemCache` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `bankSession.ts` to `AuthContext.tsx`, `ThemeContext.tsx`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `extends`, `{ createClient }`, `idemCache` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `bankSession.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Should `/graphify` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._