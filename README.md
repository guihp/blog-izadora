# ✿ Mulher dos Olhos de Deus

Blog cristão feminino em formato de diário: artigos, biblioteca de devocionais, integração com o YouTube, newsletter e painel administrativo.

Feito com **Next.js 15** (App Router), **Supabase** (banco, login e imagens) e CSS próprio.

---

## Rodando no computador

```bash
npm install
npm run dev          # http://localhost:3000
```

Sem nenhuma configuração, o site abre em **modo demonstração**: os 8 textos, 4 devocionais e 4 vídeos de exemplo (todos com o selo “Exemplo”) vêm de `src/content/demo.ts`.

## Ativando o banco de dados e o painel (Supabase)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e execute todo o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas, as políticas de segurança (RLS), o bucket de imagens `media` e as 8 categorias.
3. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (em *Project Settings → API*; use a chave **anon/publishable**, nunca a `service_role`).
   - `NEXT_PUBLIC_SITE_URL` com o endereço final do site.
4. Em **Authentication → Users**, crie seu usuário (e-mail + senha).
5. No SQL Editor, libere esse usuário como administradora:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'SEU-EMAIL@exemplo.com';
   ```
6. Recomendado: em **Authentication → Sign In / Providers**, desative “Allow new users to sign up”. Mesmo se alguém criar conta, não conseguirá alterar nada, porque a permissão de edição depende da tabela `admins`.
7. Reinicie o site, acesse **/admin** e faça login.
8. (Opcional) Na visão geral do painel, clique em **Importar exemplos** para ver o site preenchido. Depois, **Remover itens de exemplo** apaga todos de uma vez.

### O que dá para fazer no painel

| Área | Funções |
| --- | --- |
| Artigos | criar, editar, excluir, salvar rascunho, publicar/despublicar, agendar (data futura), capa com texto alternativo, categoria, SEO |
| Editor de texto | botões para título, subtítulo, negrito, itálico, link, lista, citação, **versículo em destaque**, imagem (upload), divisor, além de pré-visualização |
| Devocionais | todos os campos (referência, contexto, reflexão, aplicação, perguntas, oração) e escolha do **devocional da semana** |
| Vídeos | colar o link do YouTube, playlist/tema, destaque, miniatura personalizada |
| Categorias | criar, renomear, reordenar, excluir |
| Página inicial e textos | nome do blog, frase principal, foto do hero, carta de boas-vindas, newsletter, rodapé, página Sobre Mim (texto + foto), canal do YouTube e redes sociais |

**Versículos e referências:** no editor, o botão “✿ Versículo” cria um bloco assim:

```
::: versiculo João 15:5
Eu sou a videira, vós as varas…
:::
```

Referências escritas no meio do texto (ex.: *Salmos 23:1*, *1 Coríntios 13:4-7*) são destacadas automaticamente.

## Newsletter “Cartinhas para florescer”

O formulário envia para `/api/newsletter`, que valida o e-mail e repassa ao serviço escolhido. As chaves ficam **só no servidor**. Defina no `.env.local`:

| Serviço | Variáveis |
| --- | --- |
| Buttondown | `NEWSLETTER_PROVIDER=buttondown`, `BUTTONDOWN_API_KEY` |
| MailerLite | `NEWSLETTER_PROVIDER=mailerlite`, `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID` (opcional) |
| Brevo | `NEWSLETTER_PROVIDER=brevo`, `BREVO_API_KEY`, `BREVO_LIST_ID` |

Enquanto nada estiver configurado, quem tentar se inscrever recebe o aviso *“As cartinhas ainda não estão abertas para inscrição”*. Nenhum e-mail é guardado nem aparece como inscrito.

## Publicando (deploy)

> **Estatísticas:** execute também `supabase/analytics.sql` no SQL Editor (já aplicado no projeto atual). A cidade e o país dos visitantes aparecem quando o site está publicado na Vercel.

> **Google:** depois de publicar, cadastre o site no [Google Search Console](https://search.google.com/search-console), cole o código de verificação no painel (Página inicial e textos → Google e SEO) e envie o endereço `/sitemap.xml`.

O jeito mais simples é a [Vercel](https://vercel.com): importe o repositório, cadastre as mesmas variáveis do `.env.local` e publique. Depois do primeiro deploy, atualize `NEXT_PUBLIC_SITE_URL` com o domínio final.

## Onde mexer no código

| O quê | Arquivo |
| --- | --- |
| Nome do blog e textos padrão | `src/config/site.ts` |
| Cores, fontes e estilos | `src/app/globals.css` (variáveis no topo) |
| Conteúdo demonstrativo | `src/content/demo.ts` |
| Banco de dados e segurança | `supabase/schema.sql` |

## SEO e extras

- Metadados e Open Graph por página e por artigo, JSON-LD `BlogPosting`.
- `/sitemap.xml`, `/robots.txt` (o `/admin` fica fora do Google) e feed RSS em `/feed.xml`.
- URLs amigáveis: `/blog/titulo-do-texto`, `/blog/categoria/vida-no-secreto`, `/devocionais/permanecer-na-videira`.
- Vídeos usam o player oficial `youtube-nocookie.com`, que só carrega quando a pessoa clica em assistir, deixando a página mais leve.

## Créditos

As imagens em `public/images` foram geradas com IA (OpenAI gpt-image) com a mesma direção de arte do site, e os efeitos em `public/images/efeitos` (pétalas, rosa e fita de cetim) foram renderizados no Blender pelos scripts de `scripts/blender`. Nenhuma delas retrata pessoas reais; substitua-as pelas suas fotos quando quiser.
