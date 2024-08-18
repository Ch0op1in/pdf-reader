"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data, isLoading, isSuccess, isError, error } = trpc.authCallback.useQuery(undefined);

  useEffect(() => {
    if (isSuccess && data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [isSuccess, data, router, origin]);

  useEffect(() => {
    if (isError) {
      console.error("Erreur lors de l'authentification :", error);
      // Gérer l'erreur ici, par exemple en redirigeant vers une page d'erreur
      router.push("/error"); // Exemple de redirection vers une page d'erreur
    }
  }, [isError, error, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 text-zinc-800 animate-spin" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically</p>
      </div>
    </div>
  );
};

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
