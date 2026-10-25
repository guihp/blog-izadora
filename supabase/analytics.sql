-- ═══════════════════════════════════════════════════════════════════
--  Mulher dos Olhos de Deus — estatísticas de acesso (anônimas)
--  Sem cookies e sem guardar IP: cada visitante vira um código embaralhado
--  com um "sal" que troca todo dia e é apagado em seguida, então não dá
--  para identificar ninguém nem seguir a pessoa de um dia para o outro.
--  Pode ser executado novamente com segurança (idempotente).
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  visitor text not null,
  referrer_host text,
  source text not null default 'Direto',
  country text,
  region text,
  city text,
  device text not null default 'computador'
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);

create table if not exists public.analytics_salts (
  day date primary key,
  salt text not null default gen_random_uuid()::text
);

-- Sem políticas: ninguém lê nem grava direto, apenas pelas funções abaixo.
alter table public.page_views enable row level security;
alter table public.analytics_salts enable row level security;

-- Registra uma visualização de página (chamada pela rota /api/track).
create or replace function public.track_view(
  p_path text,
  p_referrer text,
  p_source text,
  p_country text,
  p_region text,
  p_city text,
  p_device text,
  p_client text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
  v_salt text;
begin
  if p_path is null or left(p_path, 1) <> '/' or length(p_path) > 300
     or p_path like '/admin%' or p_path like '/api%' then
    return;
  end if;

  insert into public.analytics_salts (day) values (v_day) on conflict (day) do nothing;
  select salt into v_salt from public.analytics_salts where day = v_day;
  delete from public.analytics_salts where day < v_day;

  insert into public.page_views (path, visitor, referrer_host, source, country, region, city, device)
  values (
    p_path,
    encode(sha256(convert_to(v_salt || coalesce(p_client, ''), 'UTF8')), 'hex'),
    nullif(left(p_referrer, 200), ''),
    coalesce(nullif(left(p_source, 60), ''), 'Direto'),
    nullif(upper(left(p_country, 2)), ''),
    nullif(left(p_region, 80), ''),
    nullif(left(p_city, 80), ''),
    case when p_device in ('celular', 'tablet', 'computador') then p_device else 'computador' end
  );

  -- Guarda no máximo ~13 meses de histórico
  if random() < 0.01 then
    delete from public.page_views where created_at < now() - interval '400 days';
  end if;
end;
$$;

revoke all on function public.track_view(text, text, text, text, text, text, text, text) from public;
grant execute on function public.track_view(text, text, text, text, text, text, text, text) to anon, authenticated;

-- Resumo para o painel (somente administradoras).
create or replace function public.analytics_summary(p_days int)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_tz constant text := 'America/Sao_Paulo';
  v_today date := (now() at time zone v_tz)::date;
  v_first date;
  v_from timestamptz;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  v_first := v_today - (greatest(least(coalesce(p_days, 30), 366), 1) - 1);
  v_from := v_first::timestamp at time zone v_tz;

  with v as (
    select *, (created_at at time zone v_tz)::date as day
    from public.page_views
    where created_at >= v_from
  )
  select jsonb_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct visitor) from v),
    'today_views', (select count(*) from v where day = v_today),
    'today_visitors', (select count(distinct visitor) from v where day = v_today),
    'online', (select count(distinct visitor) from v where created_at > now() - interval '5 minutes'),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'views', coalesce(x.views, 0), 'visitors', coalesce(x.visitors, 0)) order by d.day), '[]'::jsonb)
      from (select generate_series(v_first, v_today, interval '1 day')::date as day) d
      left join (select day, count(*) as views, count(distinct visitor) as visitors from v group by day) x on x.day = d.day
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'visitors', n, 'views', views) order by n desc, views desc), '[]'::jsonb)
      from (select path as label, count(distinct visitor) as n, count(*) as views from v group by path order by 2 desc, 3 desc limit 10) t
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'visitors', n) order by n desc), '[]'::jsonb)
      from (select source as label, count(distinct visitor) as n from v group by source order by 2 desc limit 10) t
    ),
    'countries', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'visitors', n) order by n desc), '[]'::jsonb)
      from (select coalesce(country, '') as label, count(distinct visitor) as n from v group by 1 order by 2 desc limit 10) t
    ),
    'cities', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'visitors', n) order by n desc), '[]'::jsonb)
      from (
        select concat_ws(', ', city, region, country) as label, count(distinct visitor) as n
        from v where city is not null
        group by 1 order by 2 desc limit 10
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'visitors', n) order by n desc), '[]'::jsonb)
      from (select device as label, count(distinct visitor) as n from v group by device order by 2 desc) t
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.analytics_summary(int) from public, anon;
grant execute on function public.analytics_summary(int) to authenticated;
