"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { signInSchema } from "@/features/admin/admin.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInFormValues = {
  email: string;
  password: string;
};

export function LoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "admin@legislacaodigital.dev",
      password: "admin123"
    }
  });

  async function onSubmit(values: SignInFormValues) {
    setError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setError("Credenciais invalidas.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-3xl">Entrar no admin</CardTitle>
        <CardDescription>
          Use uma conta demo para acessar o painel. Exemplo padrao: `admin@legislacaodigital.dev` / `admin123`.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...form.register("password")} />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          <p>Contas demo adicionais:</p>
          <p>`piracicaba@legislacaodigital.dev` / `piracicaba123`</p>
          <p>`campinas@legislacaodigital.dev` / `campinas123`</p>
        </div>
      </CardContent>
    </Card>
  );
}
