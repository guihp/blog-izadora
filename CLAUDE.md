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
- Newsletter: **Brevo** (conta da Izadora, plano grátis 300 envios/dia). Lista id **3** "Cartinhas para florescer (blog)", na pasta "Blog Mulher dos Olhos de Deus". Bloqueio de IP do Brevo **desativado** (obrigatório na Vercel). Boas-vindas automáticas na inscrição nova (`after()` em `api/newsletter`, testado: entregue). O Brevo não pede confirmação de inscrição.
- Domínio do blog: **blog.izadoracarreirobarros.com** (é `.com`, não `.com.br`; DNS na **Vercel**, ns1/ns2.vercel-dns.com). O site já está no ar lá. Domínio `izadoracarreirobarros.com` **autenticado no Brevo em 25/10/2026** (os 4 DNS foram adicionados na Vercel e a autenticação foi feita pela API `PUT /senders/domains/{d}/authenticate`). Remetente id 2 `cartinhas@izadoracarreirobarros.com` ("Mulher dos Olhos de Deus") ativo, com replyTo para o Gmail. Os modelos 1–5 já usam esse remetente, e as boas-vindas foram testadas e saíram por ele.
- Repositório no GitHub: https://github.com/guihp/blog-izadora (branch `main`, primeiro commit em 25/10/2026). Identidade do git configurada só neste repo (guihp).

## Próximos passos
1. Testar o painel com o Supabase real: criar/publicar/despublicar artigo, upload de capa, devocional da semana, vídeo, configurações, importar e remover exemplos.
2. Recomendar desativar novos cadastros (sign-ups) em Authentication no Supabase.
3. Publicar na Vercel (hospedagem recomendada; é ela que fornece a localização das visitas). Domínio final: **https://blog.izadoracarreirobarros.com** (subdomínio; na Vercel `NEXT_PUBLIC_SITE_URL` com esse valor, no `.env.local` continua o localhost:3001). Depois: Google Search Console (código em Configurações → Google e SEO) e envio do `/sitemap.xml`.
4. Preencher `authorName` (nome da autora). Na Vercel: `NEWSLETTER_PROVIDER=brevo`, `BREVO_API_KEY`, `BREVO_LIST_ID=3`.
5. Commits e pushes só quando pedirem.
6. **Corrigir na Vercel** `NEXT_PUBLIC_SITE_URL=https://blog.izadoracarreirobarros.com` e fazer um redeploy. O deploy de 25/10/2026 ainda saiu com `.com.br` no canonical e no sitemap. Não há login da Vercel nesta máquina, então só a usuária consegue trocar.

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

## E-mails (painel → E-mails, era "Newsletter")
- Abas em `src/app/admin/(panel)/emails/`: Visão geral, Escrever (`nova`), Enviadas (`enviadas/[id]` = relatório com quem recebeu/abriu/clicou, funil, links, prévia do HTML enviado), Automáticos (boas-vindas e testes, pelos eventos transacionais), Inscritas (busca, filtro, paginação, CSV em `inscritas/exportar`, e `inscritas/[email]` = histórico da pessoa), Configuração (remetente, DNS do domínio, modelos). `/admin/newsletter` redireciona para `/admin/emails`. Helpers em `emails/shared.tsx` (páginas não podem exportar componentes).
- `src/lib/brevo.ts`: cliente da API (só servidor). `pickSender()` prefere o domínio próprio e usa o nome do blog como remetente. `src/lib/email-templates.ts`: HTML de e-mail; campanhas levam `{{ unsubscribe }}`. `src/lib/brevo-sync.ts`: modelos `[Blog] …` (ids 1–5) na área Templates. `src/lib/email-reports.ts`: o Brevo não lista destinatários por campanha, então cruzamos os contatos da lista com `campaignStats` de cada um (lotes de 5, cache de 10 min com a tag `campaign-<id>`, botão Atualizar).
- **`/contacts/{email}/campaignStats` é instável** (às vezes leva 10 s ou trava). Ele tem limite de 8 s e uma nova tentativa, e as falhas viram "não conferidas" sem derrubar a página. O Brevo devolve `dns_records.dkim_record: null`, que precisa ser filtrado.
- `newsletter-actions.ts`: prévia, teste (transacional), envio (redireciona para o relatório), `refreshCampaign`, sincronizar modelos, remover inscrita. Arquivos `"use server"` só exportam funções async.

## Segurança do painel (25/10/2026)
- 2FA obrigatório (TOTP do Supabase). O middleware manda sessões `aal1` para `/admin/verificar` (cadastro por QR code na 1ª vez e código nas seguintes). `signIn` redireciona para lá. As actions `mfaEnroll`/`mfaVerify` ficam em `actions.ts`.
- `is_admin()` exige `auth.jwt()->>'aal' = 'aal2'` (em `schema.sql`, migração `is_admin_aal2` aplicada em 25/10/2026, depois do deploy). Validado no banco: admin aal1 = false, aal2 = true, anon = false.
- Limite de tentativas em memória (`src/lib/rate-limit.ts`): login 5/IP e 8/e-mail, 2FA 6/IP a cada 15 min. Cabeçalhos: HSTS, Permissions-Policy, COOP, CSP mínima (sem restringir scripts), `/admin` com `frame-ancestors 'none'`, `poweredByHeader: false`.
- Bloqueio por IP foi descartado: o IP residencial muda e o 4G tem outro.
- Recuperação (perdeu o celular): apagar de `auth.mfa_factors` (SQL no README).

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
