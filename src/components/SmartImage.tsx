import Image from "next/image";

const OPTIMIZABLE = [/^\/(?!\/)/, /^https:\/\/images\.unsplash\.com\//, /^https:\/\/i\.ytimg\.com\//, /^https:\/\/[a-z0-9-]+\.supabase\.co\//];

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Imagem que preenche o elemento pai (que deve ter position: relative e proporção definida).
 * Usa a otimização do Next.js para imagens locais e de hosts conhecidos; para outras URLs, um <img> simples.
 */
export function SmartImage({ src, alt, sizes, priority, className }: Props) {
  if (OPTIMIZABLE.some((re) => re.test(src))) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={{ objectFit: "cover" }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
