# Memória do projeto — Mulher dos Olhos de Deus

Blog cristão feminino (extensão de um canal do YouTube), em formato de diário. Todo o conteúdo e a interface são em **português (pt-BR)**, e as respostas à usuária também devem ser em português.
Guia de instalação para pessoas: `README.md`. Este arquivo guarda o contexto para o Claude.

## Estado atual (20/10/2026)
- Nome do site: **Mulher dos Olhos de Deus** (era "Entre Flores e a Palavra"). Pode ser trocado em Configurações → Nome do blog.
- **Supabase conectado** (project_ref `ahqtxbuznwbotofbbail`, MCP em `.mcp.json`). Migrações aplicadas via MCP: `init` (= `supabase/schema.sql`), `touch_updated_at_search_path` e `analytics` (= `supabase/analytics.sql`). Os dois `.sql` são idempotentes e são a fonte da verdade: ao mudar o banco, atualizar o arquivo **e** aplicar a migração.
- `.env.local` usa a chave publishable (`sb_publishable_...`, nunca a service_role) e `NEXT_PUBLIC_SITE_URL=http://localhost:3001`.
- Admin: izadoracarreirodasilva08@gmail.com (dona do blog, em `public.admins`). Login confirmado por ela, mas o CRUD do painel, o upload de imagens e "Importar/Remover exemplos" ainda **não foram testados** contra o Supabase real.
- Sessões anteriores: animações do Blender no hero, menu do painel fixo, página Estatísticas e SEO. Em 21/10/2026: reformulação visual completa (seção "Design"). Os tipos, o `next build` (rodado numa cópia) e as capturas foram conferidos.
- Avisos do advisor que são esperados: `is_admin()` executável por anon/authenticated (as políticas RLS de leitura pública precisam dela); `rls_auto_enable()` não é nossa (vem do próprio Supabase).
- A newsletter ainda não tem provedor configurado. A API devolve 503 com um aviso honesto, nunca uma inscrição falsa.
- Foi feito `git init`, mas **nenhum commit** ainda.

## Próximos passos
1. Testar o painel com o Supabase real: criar/publicar/despublicar artigo, upload de capa, devocional da semana, vídeo, configurações, importar e remover exemplos.
2. Recomendar desativar novos cadastros (sign-ups) em Authentication no Supabase.
3. Publicar na Vercel (hospedagem recomendada; é ela que fornece a localização das visitas). Depois: `NEXT_PUBLIC_SITE_URL` com o domínio final, Google Search Console (código em Configurações → Google e SEO) e envio do `/sitemap.xml`.
4. Preencher `authorName` (nome da autora) e escolher um provedor de newsletter.
5. Primeiro commit, quando a usuária pedir.

## Arquitetura
- **Next.js 15.5 (App Router) + React 19 + TypeScript**, CSS puro (sem Tailwind). As versões foram fixadas de propósito no Next 15 (o 16 muda APIs). Há um override de `postcss` no package.json para zerar o `npm audit`.
- Supabase com `@supabase/ssr` (cookies) e `@supabase/supabase-js`. Markdown via `marked` + `sanitize-html`.
- `src/lib/data.ts`: **toda** leitura passa por aqui. Se `isSupabaseConfigured` (em `src/lib/supabase/env.ts`) for falso, usa `src/content/demo.ts`. Se o banco falhar, registra o erro e retorna vazio, nunca derruba a página.
- `src/lib/supabase/public.ts` (leitura pública sem sessão), `server.ts` (com sessão, usado no painel), `browser.ts` (upload no cliente).
- `src/middleware.ts`: protege `/admin/*` (redireciona para `/admin/login`). `src/lib/auth.ts`: `getAdminSession`/`requireAdmin` chamam `notFound()` quando não há Supabase, para não poluir o log.
- `src/app/admin/actions.ts`: todas as Server Actions (CRUD, configurações, importar/remover exemplos, `previewMarkdown`). Toda mutação chama `revalidatePath("/", "layout")`.
- Os formulários do painel usam `useFormSubmit` (`src/components/admin/useFormSubmit.ts`) no lugar de `<form action>`, para evitar o reset automático do React 19, que apagaria o que foi digitado quando há erro de validação.
- `SettingsForm` usa funções `textField()`/`longField()`, e não componentes definidos dentro do render, que seriam remontados e perderiam o texto digitado.
- Configurações do site: tabela `site_settings` (linha única id=1, coluna `data jsonb`), mesclada sobre `defaultSettings` em `src/config/site.ts`. Strings vazias caem no valor padrão. Em `heroTitle`, um trecho entre `*asteriscos*` vira itálico rosa (`Emphasis.tsx`).
- Sintaxe de versículo no markdown: `::: versiculo João 15:5` … `:::`. Referências bíblicas no meio do texto são detectadas por regex em `src/lib/markdown.ts`.
- Rotas públicas ficam em `src/app/(site)/` (blog, `blog/categoria/[slug]`, `blog/[slug]`, devocionais, `meu-youtube`, sobre, busca). Também existem `sitemap.ts`, `robots.ts`, `feed.xml`, `api/newsletter`.
- Vídeos: `youtube_id` nulo = vídeo de exemplo (mostra um placeholder). O player usa `youtube-nocookie` e só carrega no clique.
- As imagens de demonstração (Unsplash) estão em `public/images/`. `SmartImage` usa `next/image` para hosts conhecidos (local, unsplash, ytimg, *.supabase.co) e `<img>` para os demais.

## Regras de conteúdo (pedidas pela usuária)
- Nunca inventar vídeos, número de inscritos ou dados do canal. Os exemplos sempre ficam marcados como "Exemplo".
- Os 8 títulos de demonstração são **exemplos**, não artigos publicados.
- Estética: feminina, romântica, vintage e editorial, mas não infantil. Paleta: #F4DDE3, #D9A7B3, #FFF9F2, #FFFEFC, #806B60, #B8C5B0 (tokens em `globals.css`). Prioridade para o celular.

## Dicas de ambiente (Windows)
- **A porta 3000 é usada por outro projeto da usuária (`hulgo-main`). Não encerrar esse processo.** Rodar este blog na porta **3001**: `npx next dev -p 3001`.
- Não rodar `next build` com o `next dev` ligado, porque os dois usam `.next` e isso gera erros 500/404 falsos. Para recuperar: parar tudo, `rm -rf .next` e buildar de novo.
- Parar a tarefa em segundo plano não mata o processo `node` filho. Encerrar pelo PID da porta, conferindo antes que o `CommandLine` contém `blog-izadora`.
- Capturas de tela: Chrome headless (`C:\Program Files\Google\Chrome\Application\chrome.exe --headless --screenshot`). A janela tem largura mínima de cerca de 500px, então para simular celular é preciso um iframe de 390px servido **pela mesma origem**, por causa do `X-Frame-Options: SAMEORIGIN`. Arquivo temporário em `public/`, apagado depois.
- `?static` na URL desliga as animações de entrada (útil em capturas). Isso está no script inline de `src/app/layout.tsx`.
- A usuária costuma deixar o `next dev -p 3001` ligado (com hot reload). Para validar com `next build` sem derrubá-lo: copiar o projeto para o scratchpad (sem `node_modules`, `.next` e `.git`), criar uma junction `node_modules` apontando para a pasta real e rodar o build ali. **Ao apagar a cópia, remover primeiro a junction com `cmd /c rmdir`** (nunca `rm -rf` com a junction no lugar). Uma prévia da cópia pode rodar na porta 3005.
- O MCP do Supabase às vezes responde `Invalid or expired requestState`. Nesse caso nada é executado: basta repetir a mesma chamada. Conferir com `list_migrations` antes de reaplicar.
- Para testar RLS pelo MCP: `set local role anon;` ou `select set_config('request.jwt.claims', json_build_object('sub', <user_id>, 'role','authenticated')::text, true); set local role authenticated;`.
- As políticas RLS foram validadas com PGlite, simulando os esquemas `auth`/`storage` (16 verificações OK). Script em scratchpad, não versionado.

## Design (reformulação de 21/10/2026)
- Direção: editorial romântico. Títulos grandes em Cormorant 300, texto em **DM Sans** (substituiu a Nunito Sans), colagem de papelaria (recortes com transparência), grade *bento* nas categorias, faixas escuras (`--espresso`) alternando com o creme e rodapé com o nome do blog gigante.
- Página inicial: hero com foto em arco + rosa do Blender + laço + polaroide + selo girando (`CircleBadge`) e a fita de cetim (`SilkRibbon`) atrás; `Marquee` com as categorias; carta com foto; destaque "em breve" quando não há textos (`feature-empty`); bento de categorias; faixa escura do YouTube; versículo grande (vem de `heroNote`); newsletter com foto (âncora `#newsletter`, usada pelo botão do cabeçalho).
- Páginas internas usam `PageHero` (título + foto em arco). Imagem de cada categoria: `categoryImage(slug, i)` em `src/config/site.ts` (categorias novas reaproveitam as imagens em sequência). Artigos têm `ReadingProgress`.
- Imagens geradas com a API da OpenAI (`gpt-image-2`; recortes transparentes com `gpt-image-1.5`, porque o 2 não aceita `background: transparent`). O token fica em `.env.txt` (no `.gitignore`), **nunca** em código nem em `NEXT_PUBLIC_`. Fotos em `public/images/` (JPG ≤1600px), categorias em `public/images/categorias/`, recortes WebP em `public/images/recortes/`. Nenhuma imagem retrata pessoas reais (só mãos/objetos). A foto do Sobre continua sendo um placeholder para a foto dela.
- `DEFAULT_OG_IMAGE` = `/images/compartilhar.jpg` (1200×630).

## Animações (Blender)
- Fita de cetim: `fita.py` (Blender, 168 quadros em loop, fundo transparente) → `fita_prep.py` (Python + Pillow: reduz para 1024px, apaga as pontas no alfa e gera `fita.webp`) → `fita_video.py` (Blender codifica `fita.webm` VP9 **com alfa**, ~900 KB; não há ffmpeg na máquina). **Nunca usar `mix-blend-mode`/máscara na fita**: dentro de um elemento com opacidade isso deixava a página travando e mostrava um retângulo. `SilkRibbon` só carrega o vídeo no computador (≥700px), fora do Safari/iOS (não exibem VP9 com alfa), sem economia de dados e sem "reduzir movimento"; nos outros casos fica o `fita.webp`. A fita fica na base do hero, abaixo dos temas, sem cruzar o título.
- `scripts/blender/flores.py` renderiza (Blender 5.2, EEVEE, fundo transparente) as 8 pétalas e os 56 quadros da rosa: `blender -b --factory-startup -P flores.py -- petals|rose <pasta> [quadros]`. `pack.py` gera as pétalas WebP e `pack_rose.py <destino> 300 70` gera a rosa animada (38 quadros, toca uma vez, ~277 KB). Saída em `public/images/efeitos/`.
- `PetalFall.tsx` (pétalas caindo atrás do hero, só com JS, fora de `?static` e sem "reduzir movimento"). A rosa fica em `.hero__rose` com `<picture>` (estática `rosa.webp` para quem reduz movimento). Também há zoom lento da foto do hero. Pétalas: 8 no computador, 5 no celular (os brilhinhos foram removidos para o hero ficar menos carregado).
- Painel: a barra lateral é `sticky` (fixa) no computador e o topo é fixo no celular (`admin.css`).

## Estatísticas de acesso (painel → Estatísticas)
- `supabase/analytics.sql` (migração `analytics` já aplicada): tabela `page_views` sem políticas RLS (ninguém lê direto), `track_view()` (anon pode chamar; ignora `/admin` e `/api`) e `analytics_summary(dias)` (só `is_admin()`). Sem cookies e sem IP: o visitante é `sha256(sal diário + IP + user-agent)`, e o sal do dia anterior é apagado. Histórico de ~400 dias. Fuso: America/Sao_Paulo.
- Fluxo: `src/components/Analytics.tsx` (no layout do site, usa `sendBeacon` a cada troca de rota e guarda a origem da visita em `sessionStorage`) → `src/app/api/track/route.ts` (filtra robôs, recusa outra origem, limita 30/min por IP) → RPC. Classificação de origem, aparelho e geolocalização em `src/lib/analytics.ts`.
- Localização vem dos cabeçalhos da hospedagem (Vercel `x-vercel-ip-*`, Netlify `x-nf-geo`, Cloudflare `cf-ipcountry`). Em localhost ela fica vazia, o que é esperado.
- Aparelhos que abrem o painel deixam de ser contados (`localStorage` `mdod:sem-contagem`). Para mudar, há uma opção no fim da página de estatísticas.
- Cor das barras `--chart: #c46f86` (validada com o validador do skill dataviz: contraste ≥ 3:1).

## SEO
- `src/lib/seo.ts` `openGraph()`: **usar sempre** que a página definir `openGraph`, porque o Next substitui o do layout e o nome do site, o locale e a imagem se perdem.
- `src/components/JsonLd.tsx` (`JsonLd`, `breadcrumbs`). Início: WebSite + SearchAction + autora (`#autora`). Artigo: BlogPosting. Devocional: Article. Sobre: AboutPage. Meu YouTube: VideoObject (só vídeos reais com `youtube_id` e data). Todos com BreadcrumbList.
- Conteúdo `is_demo` leva `noindex` e fica fora do sitemap. Buscas internas (`?q=`) e os filtros de devocionais também levam `noindex`. Paginação tem canonical próprio.
- Configurações → "Google e SEO": `seoDescription`, `authorName`, `googleVerification`, `bingVerification` (aceita colar a tag `<meta>` inteira). Há também `app/manifest.ts`.
