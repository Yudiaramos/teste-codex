import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/admin";

  return (
    <main className="page-shell py-12">
      <div className="mb-8 space-y-3">
        <span className="section-eyebrow">Painel administrativo</span>
        <h1 className="text-5xl">Acesso ao admin</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Ambiente demo com controle de acesso basico para admins globais e admins de municipio.
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
