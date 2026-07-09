import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Auth route group layout — a centered card on a subtle background.
 * Redirects already-authenticated users to the dashboard.
 */
export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (user?.orgId) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-primary"
          >
            Deskly
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
