import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbs, JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { parsePage, parseQ, PostListing } from "@/components/PostListing";
import { categoryImage, SITE_URL } from "@/config/site";
import { getCategoryBySlug } from "@/lib/data";
import { openGraph } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const page = parsePage(sp.pagina);
  const path = `/blog/categoria/${category.slug}${page > 1 ? `?pagina=${page}` : ""}`;
  return {
    title: page > 1 ? `${category.name} (página ${page})` : category.name,
    description: category.description,
    alternates: { canonical: path },
    // Resultados de busca interna não devem ser indexados
    robots: parseQ(sp.q) ? { index: false, follow: true } : undefined,
    openGraph: await openGraph({ title: category.name, description: category.description, url: path }),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbs(SITE_URL, [
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/categoria/${category.slug}` },
        ])}
      />
      <PageHero
        eyebrow="Categoria"
        title={<em>{category.name}</em>}
        text={category.description || undefined}
        image={{ src: categoryImage(category.slug, category.sort_order), alt: "" }}
      />
      <section className="container" style={{ paddingBottom: 40 }}>
        <PostListing q={parseQ(sp.q)} category={category.slug} page={parsePage(sp.pagina)} />
      </section>
    </>
  );
}
