import Link from "next/link";
import { DevotionalForm } from "@/components/admin/DevotionalForm";

export default function NewDevotional() {
  return (
    <>
      <header>
        <div>
          <Link href="/admin/devocionais" className="text-link">
            ← Devocionais
          </Link>
          <h1 style={{ marginTop: 10 }}>Novo devocional</h1>
        </div>
      </header>
      <DevotionalForm />
    </>
  );
}
