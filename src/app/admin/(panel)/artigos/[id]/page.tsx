import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PostForm } from "@/components/admin/PostForm";
import { getAdminSession } from "@/lib/auth";
import type { Category, Post } from "@/lib/types";
import { deletePost } from "../../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> };

export default async function EditPost({ params, searchParams }: Props) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);
  const { supabase } = await getAdminSession();
  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!post) notFound();

  const notice = salvo === "publicado" ? "Publicado! ♡" : salvo === "rascunho" ? "Rascunho criado. Ele só aparece no site depois de publicado." : undefined;

  return (
    <>
      <header>
        <div>
          <Link href="/admin/artigos" className="text-link">
            ← Artigos
          </Link>
          <h1 style={{ marginTop: 10 }}>Editar artigo</h1>
        </div>
        <form action={deletePost}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message="Excluir este artigo? Esta ação não pode ser desfeita.">Excluir artigo</ConfirmButton>
        </form>
      </header>
      <PostForm post={post as Post} categories={(categories ?? []) as Category[]} notice={notice} />
    </>
  );
}
