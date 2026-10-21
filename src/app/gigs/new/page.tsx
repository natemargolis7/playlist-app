import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { GigForm } from "./gig-form";

export default async function NewGigPage() {
  const { profile } = await requireSession();
  if (profile.role !== "venue") redirect("/gigs");
  return (
    <div>
      <PageHeader title="Post a gig" description="Musicians can apply as soon as it's live." />
      <GigForm />
    </div>
  );
}
