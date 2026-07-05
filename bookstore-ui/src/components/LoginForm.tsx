"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/cart");
    }
  }, [status, router]);

  const errorMessages: Record<string, string> = {
    OAuthCallback: "Authentication failed after returning from Keycloak. Try signing in again.",
    OAuthAccountNotLinked: "Your Keycloak account is not linked. Contact support.",
    AccessDenied: "Access was denied by Keycloak. Try again or choose a different account.",
    Configuration: "Authentication is not configured correctly. Check the server logs.",
  };

  const errorMessage = error ? errorMessages[error] ?? `Sign in failed: ${error}` : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold">Bookstore Login</h1>
        <p className="mt-3 text-slate-600">
          Login to secure your cart and place orders through the protected order service.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-3xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
            {errorMessage}
          </div>
        ) : null}

        {status === "authenticated" ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-slate-100 p-4 text-slate-800">
              Signed in as <span className="font-medium">{session.user?.email}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/products" })}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/cart" })}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Login with Keycloak
            </button>
            <p className="mt-4 text-sm text-slate-500">
              Use your Keycloak credentials to access the cart and order creation flow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
