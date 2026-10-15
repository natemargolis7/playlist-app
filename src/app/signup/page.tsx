import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "./signup-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell title="Create your account" subtitle="Free for musicians and venues.">
      <SignupForm initialRole={role === "venue" ? "venue" : "musician"} />
    </AuthShell>
  );
}
