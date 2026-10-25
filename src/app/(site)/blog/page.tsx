import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { parsePage, parseQ, PostListing } from "@/components/PostListing";
import { openGraph } from "@/lib/seo";

const DESCRIPTION =
  "Reflexões sobre fé na vida real, propósito, identidade em Cristo, maturidade espiritual e vida no secreto.";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePage(params.pagina);
  const path = page > 1 ? `/blog?pagina=${page}` : "/blog";
  return {
    title: page > 1 ? `Blog (página ${page})` : "Blog",
    description: DESCRIPTION,
    alternates: { canonical: path },
    robots: parseQ(params.q) ? { index: false, follow: true } : undefined,
    openGraph: await openGraph({ title: "Blog", description: DESCRIPTION, url: path }),
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = parseQ(params.q);
  const page = parsePage(params.pagina);

  return (
    <>
      <PageHero
        eyebrow="O diário"
        title={
          <>
            Textos para <em>florescer</em>
          </>
        }
        text="Reflexões sinceras sobre fé, propósito, identidade e a beleza de caminhar com Jesus todos os dias."
        image={{ src: "/images/pagina-blog.jpg", alt: "Diários de linho amarrados com fita, caneta-tinteiro e pétalas de rosa" }}
      />
      <section className="container" style={{ paddingBottom: 40 }}>
        <PostListing q={q} page={page} />
      </section>
    </>
  );
}
