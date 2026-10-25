import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getAdminSession } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { deleteCategory } from "../../actions";

export default async function AdminCategories() {
  const { supabase } = await getAdminSession();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  const categories = (data ?? []) as Category[];

  return (
    <>
      <header>
        <div>
          <h1>Categorias</h1>
          <p>Cada categoria ganha uma página própria em /blog/categoria/…</p>
        </div>
      </header>
      <section className="panel">
        <h2>Nova categoria</h2>
        <CategoryForm />
      </section>
      {categories.map((c) => (
        <section key={c.id} className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{c.name}</h2>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`Excluir a categoria “${c.name}”? Os textos dela ficarão sem categoria.`}>Excluir</ConfirmButton>
            </form>
          </div>
          <CategoryForm category={c} />
        </section>
      ))}
    </>
  );
}
