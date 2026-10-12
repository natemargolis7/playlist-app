import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { GigForm } from "./gig-form";

export default async function NewGigPage() {
  const { profile } = await requireSession();
  if (profile.role !== "venue") redirect("/gigs");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Post a gig</h1>
      <GigForm />
    </div>
  );
}
