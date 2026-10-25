import type { SiteSettings } from "@/lib/types";

/**
 * ✿ Valores padrão do site.
 * Tudo aqui pode ser alterado pelo painel (/admin/configuracoes) quando o
 * Supabase estiver configurado. Para trocar o nome do blog direto no código,
 * basta editar `siteName` abaixo.
 */
export const defaultSettings: SiteSettings = {
  siteName: "Mulher dos Olhos de Deus",
  tagline: "Um diário sobre fé, propósito e vida com Deus",
  heroEyebrow: "Diário de uma menina que ama Jesus",
  // Trechos entre *asteriscos* aparecem em itálico rosa
  heroTitle: "Uma vida com Deus, *um coração em transformação.*",
  heroSubtitle:
    "Reflexões sinceras sobre fé, propósito, identidade e a beleza de caminhar com Jesus todos os dias.",
  heroImageUrl: "/images/hero-principal.jpg",
  heroImageAlt:
    "Bíblia aberta sobre lençóis claros, com marcador de cetim rosa, buquê de rosas e peônias, xícara de chá e óculos",
  heroNote: "“Permanecei em mim, e eu permanecerei em vós.” — João 15:4",
  welcomeTitle: "Oi, amiga! Que bom ter você aqui. ♡",
  welcomeLetter: [
    "Criei este cantinho para compartilhar aquilo que Deus tem construído em mim, as verdades que tenho aprendido na Palavra e as reflexões que podem nos ajudar a crescer juntas na fé.",
    "Não quero falar apenas sobre uma vida cristã bonita por fora, mas também sobre o que acontece no secreto, nos processos, nas dúvidas, nas renúncias e nos dias em que precisamos aprender a confiar novamente.",
    "Que este espaço te aproxime de Jesus e te lembre de que ainda há muito para florescer quando permanecemos nEle.",
  ].join("\n\n"),
  welcomeSignature: "Com carinho, sua irmã em Cristo ♡",
  weeklyTitle: "Um momento com a Palavra",
  newsletterTitle: "Cartinhas para florescer",
  newsletterText:
    "Reflexões, devocionais e pequenas lembranças da Palavra para acompanhar sua caminhada com Jesus.",
  footerPhrase: "Que tudo em nós aponte para Ele. ♡",
  aboutTitle: "Prazer, eu sou a menina por trás deste diário",
  aboutText: [
    "Oi! Se você chegou até aqui, quero te contar um pouquinho de quem eu sou — e, principalmente, de Quem tem me alcançado.",
    "Eu cresci ouvindo falar de Deus, mas houve um tempo em que percebi que conhecia muito *sobre* Ele e pouco *dEle*. Foi aos poucos, entre páginas sublinhadas da Bíblia, orações sinceras e muitos dias comuns, que Jesus deixou de ser apenas um assunto e passou a ser o centro da minha vida.",
    "Escrever sempre foi o jeito que encontrei de organizar o coração. Meus cadernos guardam versículos, perguntas, lágrimas e respostas. Este blog e o meu canal nasceram do desejo de abrir esses cadernos e compartilhar aquilo que Deus tem me ensinado — sem fingir que está tudo pronto, mas com a certeza de que Ele é fiel para completar a boa obra que começou (Filipenses 1:6).",
    "Meu desejo é encorajar outras mulheres a desenvolverem uma vida verdadeira com Jesus: uma fé que se sustenta no secreto, que amadurece nos processos e que encontra identidade na Palavra, e não nas expectativas do mundo.",
    "Fico muito feliz que você esteja aqui. Pega um café, abre a sua Bíblia e vamos caminhar juntas.",
  ].join("\n\n"),
  aboutPhotoUrl: "/images/sobre-provisoria.jpg",
  aboutPhotoAlt: "Espaço reservado para a sua fotografia: uma rosa em um vaso fino de vidro, sobre fundo claro",
  aboutSignature: "Com amor, sua irmã em Cristo ♡",
  youtubeChannelUrl: "",
  youtubeChannelName: "Meu canal",
  youtubeIntro:
    "No canal, eu converso com você sobre fé, propósito, identidade e vida com Deus — como uma conversa entre amigas, com a Bíblia aberta no colo. Os vídeos e os textos daqui se completam: muitos assuntos começam lá e continuam aqui, por escrito.",
  seoDescription:
    "Diário cristão para mulheres: reflexões sobre fé, propósito, identidade em Cristo, devocionais e vida com Deus todos os dias.",
  authorName: "",
  googleVerification: "",
  bingVerification: "",
  socials: { instagram: "", tiktok: "", pinterest: "", spotify: "", email: "" },
};

// Na Vercel, se NEXT_PUBLIC_SITE_URL não for definida, usa o domínio de produção do projeto
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
).replace(/\/$/, "");

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/blog", label: "Blog" },
  { href: "/devocionais", label: "Devocionais" },
  { href: "/meu-youtube", label: "Meu YouTube" },
  { href: "/sobre", label: "Sobre Mim" },
] as const;

export const POSTS_PER_PAGE = 9;

/** Imagem usada ao compartilhar páginas que não têm capa própria. */
export const DEFAULT_OG_IMAGE = {
  url: "/images/compartilhar.jpg",
  width: 1200,
  height: 630,
  alt: "Mãos escrevendo em um diário ao lado de uma Bíblia aberta e flores em tons de rosa",
};

/**
 * Imagem de cada categoria (pelo slug). Categorias novas, criadas no painel,
 * usam as imagens da lista em sequência.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  "fe-na-vida-real": "/images/categorias/fe-na-vida-real.jpg",
  devocionais: "/images/categorias/devocionais.jpg",
  "proposito-e-chamado": "/images/categorias/proposito-e-chamado.jpg",
  "identidade-em-cristo": "/images/categorias/identidade-em-cristo.jpg",
  "maturidade-espiritual": "/images/categorias/maturidade-espiritual.jpg",
  "vida-no-secreto": "/images/categorias/vida-no-secreto.jpg",
  "processos-e-testemunhos": "/images/categorias/processos-e-testemunhos.jpg",
  "estilo-de-vida-cristao": "/images/categorias/estilo-de-vida-cristao.jpg",
};

export function categoryImage(slug: string, index: number) {
  const all = Object.values(CATEGORY_IMAGES);
  return CATEGORY_IMAGES[slug] ?? all[index % all.length];
}
