# Graph Report - crispy-octo-spoon  (2026-07-02)

## Corpus Check
- 76 files · ~45,152 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 163 nodes · 228 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6cfc7f57`
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

## God Nodes (most connected - your core abstractions)
1. `What You Must Do When Invoked` - 12 edges
2. `/graphify` - 10 edges
3. `graphify reference: extra exports and benchmark` - 8 edges
4. `useMaestroDemo()` - 8 edges
5. `ContaDashboard()` - 7 edges
6. `useAdvancedSignatureDemo()` - 7 edges
7. `usePixSigningDemo()` - 7 edges
8. `handler()` - 6 edges
9. `graphify reference: query, path, explain` - 5 edges
10. `Home()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `AssinaturasPage()` --calls--> `useAdvancedSignatureDemo()`  [EXTRACTED]
  frontend/src/app/conta/assinaturas/page.tsx → frontend/src/components/docusign/AdvancedSignatureDemo.tsx
- `ContaLayout()` --calls--> `firstName()`  [EXTRACTED]
  frontend/src/app/conta/layout.tsx → frontend/src/lib/bankSession.ts
- `ContaDashboard()` --calls--> `useMaestroDemo()`  [EXTRACTED]
  frontend/src/app/conta/page.tsx → frontend/src/components/docusign/MaestroDemo.tsx
- `ContaDashboard()` --calls--> `firstName()`  [EXTRACTED]
  frontend/src/app/conta/page.tsx → frontend/src/lib/bankSession.ts
- `PixPage()` --calls--> `usePixSigningDemo()`  [EXTRACTED]
  frontend/src/app/conta/pix/page.tsx → frontend/src/components/docusign/PixSigningDemo.tsx

## Import Cycles
- None detected.

## Communities (20 total, 5 thin omitted)

### Community 0 - "page.tsx"
Cohesion: 0.17
Nodes (16): AssinaturasPage(), DOCUMENTOS, ContaDashboard(), fmtBRL(), TRANSACOES, CHAVES, PixPage(), Home() (+8 more)

### Community 1 - "AuthContext.tsx"
Cohesion: 0.13
Nodes (12): inter, metadata, LoginPage(), AdminNavBar(), AuthContext, AuthContextType, AuthProvider(), MASTER_ADMIN_EMAILS (+4 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.13
Nodes (15): Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Step 0 - GitHub repos and multi-path merge (only if a URL or several paths), Step 1 - Ensure graphify is installed, Step 2.5 - Video and audio (only if video files detected), Step 2 - Detect files, Step 3 - Extract entities and relationships (+7 more)

### Community 3 - "ThemeContext.tsx"
Cohesion: 0.26
Nodes (10): TemaPage(), StoredTheme, ThemeContext, ThemeContextType, useTheme(), applyTheme(), hexToRgbTriplet(), Theme (+2 more)

### Community 4 - "bankSession.ts"
Cohesion: 0.27
Nodes (8): ContaLayout(), NAV_ITEMS, BankSession, clearBankSession(), createBankSession(), deriveNameFromEmail(), firstName(), getBankSession()

### Community 5 - "/graphify"
Cohesion: 0.20
Nodes (9): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Usage (+1 more)

### Community 6 - "maestro.js"
Cohesion: 0.38
Nodes (9): axios, CORS_HEADERS, docusign, getEnv(), getJwtToken(), handler(), json(), maestroFetch() (+1 more)

### Community 7 - "MaestroDemo.tsx"
Cohesion: 0.36
Nodes (7): CartoesPage(), EmprestimosPage(), fmtBRL(), MaestroFlowOptions, useCartaoMaestroFlow(), useMaestroDemo(), useMaestroFlow()

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

## Knowledge Gaps
- **64 isolated node(s):** `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `What You Must Do When Invoked` connect `What You Must Do When Invoked` to `/graphify`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `/graphify` connect `/graphify` to `What You Must Do When Invoked`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `useMaestroDemo()` connect `MaestroDemo.tsx` to `page.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `graphify`, `Usage`, `What graphify is for` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._