export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
};

export type PublishStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  cover_alt: string;
  category_id: string | null;
  category?: Category | null;
  status: PublishStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_demo: boolean;
  updated_at: string;
};

export type Devotional = {
  id: string;
  slug: string;
  title: string;
  bible_reference: string;
  book: string;
  theme: string;
  verse_text: string;
  summary: string;
  main_text: string;
  context: string;
  reflection: string;
  application: string;
  questions: string[];
  prayer: string;
  cover_url: string | null;
  cover_alt: string;
  status: PublishStatus;
  published_at: string | null;
  is_weekly: boolean;
  is_demo: boolean;
  updated_at: string;
};

export type Video = {
  id: string;
  youtube_id: string | null;
  /** Miniatura personalizada (opcional). Sem ela, usamos a do YouTube. */
  thumbnail_url: string | null;
  title: string;
  description: string;
  playlist: string;
  is_featured: boolean;
  published_at: string | null;
  sort_order: number;
  is_demo: boolean;
};

export type SocialLinks = {
  instagram: string;
  tiktok: string;
  pinterest: string;
  spotify: string;
  email: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroNote: string;
  welcomeTitle: string;
  welcomeLetter: string;
  welcomeSignature: string;
  weeklyTitle: string;
  newsletterTitle: string;
  newsletterText: string;
  footerPhrase: string;
  aboutTitle: string;
  aboutText: string;
  aboutPhotoUrl: string;
  aboutPhotoAlt: string;
  aboutSignature: string;
  youtubeChannelUrl: string;
  youtubeChannelName: string;
  youtubeIntro: string;
  /** Descrição que aparece no Google para a página inicial (até ~160 caracteres). */
  seoDescription: string;
  /** Nome da autora, usado como autoria dos artigos para o Google. */
  authorName: string;
  /** Códigos de verificação do Google Search Console e do Bing Webmaster Tools. */
  googleVerification: string;
  bingVerification: string;
  socials: SocialLinks;
};
