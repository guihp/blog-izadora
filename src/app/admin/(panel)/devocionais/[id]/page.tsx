import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DevotionalForm } from "@/components/admin/DevotionalForm";
import { getAdminSession } from "@/lib/auth";
import type { Devotional } from "@/lib/types";
import { deleteDevotional } from "../../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> };

export default async function EditDevotional({ params, searchParams }: Props) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);
  const { supabase } = await getAdminSession();
  const { data } = await supabase.from("devotionals").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <header>
        <div>
          <Link href="/admin/devocionais" className="text-link">
            ← Devocionais
          </Link>
          <h1 style={{ marginTop: 10 }}>Editar devocional</h1>
        </div>
        <form action={deleteDevotional}>
          <input type="hidden" name="id" value={data.id} />
          <ConfirmButton message="Excluir este devocional?">Excluir devocional</ConfirmButton>
        </form>
      </header>
      <DevotionalForm devotional={data as Devotional} notice={salvo ? "Devocional salvo! ♡" : undefined} />
    </>
  );
}
