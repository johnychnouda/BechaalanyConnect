import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;
    const token = router.query.token as string | undefined;
    if (token) {
      // Store the token (customize as needed: localStorage, context, etc.)
      localStorage.setItem("auth_token", token);
      // Optionally: fetch user info here
      router.replace("/"); // Redirect to home or dashboard
    } else {
      // No token found, redirect to login or show error
      router.replace("/auth/signin?error=missing_token");
    }
  }, [router]);

  return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Signing you in...</div>;
} 