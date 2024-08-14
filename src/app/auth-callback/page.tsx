import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { trpc } from "../_trpc/client";
import { useEffect } from "react";

const AuthCallback = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const origin = searchParams.get('origin');

    const { data, isLoading, isSuccess } = trpc.authCallback.useQuery(undefined);

    useEffect(() => {
        if (isSuccess && data?.success) {
            router.push(origin ? `/${origin}` : "/dashboard");
        }
    }, [isSuccess, data, router, origin]);

    // Tu peux gérer l'affichage pendant le chargement ou les erreurs ici si nécessaire
    if (isLoading) return <p>Loading...</p>;

    return null; // Ou tout autre composant de rendu si besoin
};

export default AuthCallback;
