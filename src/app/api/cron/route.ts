import { NextResponse, type NextRequest } from "next/server";
import { flushNotifications } from "@/lib/notifications";

// Daily safety net (see vercel.json): closes overdue applications, sends reminders and any
// emails that didn't go out right after the action that caused them.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await flushNotifications();
  return NextResponse.json({ ok: true });
}
