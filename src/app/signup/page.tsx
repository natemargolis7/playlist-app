import { SignupForm } from "./signup-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <SignupForm initialRole={role === "venue" ? "venue" : "musician"} />
    </div>
  );
}
