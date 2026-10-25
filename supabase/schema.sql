-- ═══════════════════════════════════════════════════════════════════
--  Mulher dos Olhos de Deus — esquema do banco (Supabase / Postgres)
--  Execute este arquivo inteiro no SQL Editor do Supabase.
--  Ele pode ser executado novamente com segurança (idempotente).
-- ═══════════════════════════════════════════════════════════════════


-- ───────────── Administradoras ─────────────
-- Somente usuários listados aqui podem alterar o conteúdo do site.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────── Atualização automática de updated_at ─────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────── Categorias ─────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ───────────── Artigos ─────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  cover_alt text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ───────────── Devocionais ─────────────
create table if not exists public.devotionals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  bible_reference text not null default '',
  book text not null default '',
  theme text not null default '',
  verse_text text not null default '',
  summary text not null default '',
  main_text text not null default '',
  context text not null default '',
  reflection text not null default '',
  application text not null default '',
  questions text[] not null default '{}',
  prayer text not null default '',
  cover_url text,
  cover_alt text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  is_weekly boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists devotionals_published_idx on public.devotionals (status, published_at desc);
-- Garante que exista no máximo um "devocional da semana"
create unique index if not exists devotionals_one_weekly on public.devotionals (is_weekly) where is_weekly;

drop trigger if exists devotionals_touch on public.devotionals;
create trigger devotionals_touch before update on public.devotionals
  for each row execute function public.touch_updated_at();

-- ───────────── Vídeos do YouTube ─────────────
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  thumbnail_url text,
  title text not null,
  description text not null default '',
  playlist text not null default '',
  is_featured boolean not null default false,
  published_at date,
  sort_order int not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────── Configurações do site (linha única) ─────────────
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════
--  Row Level Security
--  Visitantes: leem apenas conteúdo publicado.
--  Administradoras (tabela admins): leem e alteram tudo.
-- ═══════════════════════════════════════════════════════════════════
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.devotionals enable row level security;
alter table public.videos enable row level security;
alter table public.site_settings enable row level security;

-- admins: cada usuária pode apenas verificar a própria linha. Inserções só pelo SQL Editor.
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins for select to authenticated
  using (user_id = auth.uid());

-- categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- posts
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts for select
  using ((status = 'published' and published_at <= now()) or public.is_admin());
drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write" on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- devotionals
drop policy if exists "devotionals_public_read" on public.devotionals;
create policy "devotionals_public_read" on public.devotionals for select
  using ((status = 'published' and published_at <= now()) or public.is_admin());
drop policy if exists "devotionals_admin_write" on public.devotionals;
create policy "devotionals_admin_write" on public.devotionals for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- videos
drop policy if exists "videos_public_read" on public.videos;
create policy "videos_public_read" on public.videos for select using (true);
drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write" on public.videos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site_settings
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select using (true);
drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  Storage: bucket público "media" para capas e imagens dos textos
-- ═══════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  Categorias iniciais
-- ═══════════════════════════════════════════════════════════════════
insert into public.categories (slug, name, description, sort_order) values
  ('fe-na-vida-real', 'Fé na vida real', 'Uma fé que atravessa a rotina, o cansaço e as perguntas sinceras.', 1),
  ('devocionais', 'Devocionais', 'Pausas com a Palavra para começar ou terminar o dia aos pés de Jesus.', 2),
  ('proposito-e-chamado', 'Propósito e chamado', 'Sobre vocação, legado e obedecer a Deus nos pequenos passos.', 3),
  ('identidade-em-cristo', 'Identidade em Cristo', 'Quem somos à luz do que Ele diz, e não do que o mundo exige.', 4),
  ('maturidade-espiritual', 'Maturidade espiritual', 'Crescer, aprender a discernir e amadurecer na fé com paciência.', 5),
  ('vida-no-secreto', 'Vida no secreto', 'Oração, intimidade e aquilo que Deus constrói longe dos olhos.', 6),
  ('processos-e-testemunhos', 'Processos e testemunhos', 'Histórias reais de espera, dor, cura e fidelidade de Deus.', 7),
  ('estilo-de-vida-cristao', 'Estilo de vida cristão', 'Escolhas, hábitos e beleza de uma vida que aponta para Ele.', 8)
on conflict (slug) do nothing;

-- ═══════════════════════════════════════════════════════════════════
--  DEPOIS de criar sua conta em Authentication → Users, rode:
--
--  insert into public.admins (user_id)
--  select id from auth.users where email = 'SEU-EMAIL@exemplo.com';
-- ═══════════════════════════════════════════════════════════════════
