"use client";

import { Suspense} from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return <div>Loading...</div>;
}
