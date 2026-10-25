import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";
import { getAdminSession } from "@/lib/auth";
import type { Category } from "@/lib/types";

export default async function NewPost() {
  const { supabase } = await getAdminSession();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <>
      <header>
        <div>
          <Link href="/admin/artigos" className="text-link">
            ← Artigos
          </Link>
          <h1 style={{ marginTop: 10 }}>Novo artigo</h1>
        </div>
      </header>
      <PostForm categories={(data ?? []) as Category[]} />
    </>
  );
}
