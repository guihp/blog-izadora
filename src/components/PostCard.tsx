import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/utils";
import { SmartImage } from "./SmartImage";

export function PostCard({ post, priority, index = 0 }: { post: Post; priority?: boolean; index?: number }) {
  return (
    <article className="post-card reveal" style={{ ["--reveal-delay" as string]: `${(index % 3) * 90}ms` }}>
      <div className="post-card__media">
        {post.cover_url ? (
          <SmartImage
            src={post.cover_url}
            alt={post.cover_alt || ""}
            sizes="(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
          />
        ) : null}
        {post.is_demo && <span className="badge badge--demo">Exemplo</span>}
      </div>
      <div className="post-card__meta">
        {post.category && (
          <Link href={`/blog/categoria/${post.category.slug}`} className="category-link">
            {post.category.name}
          </Link>
        )}
        {post.category && <span className="dot" aria-hidden="true" />}
        {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
        <span className="dot" aria-hidden="true" />
        <span>{readingTime(post.content)} min de leitura</span>
      </div>
      <h3 className="post-card__title">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="post-card__excerpt">{post.excerpt}</p>
    </article>
  );
}
