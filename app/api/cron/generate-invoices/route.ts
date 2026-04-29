import { NextRequest, NextResponse } from "next/server";
import { runInvoiceGenerationCycle, syncAllClientDueDates } from "@/lib/billing-cycle";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cycleSummary = await runInvoiceGenerationCycle();
    const syncSummary = await syncAllClientDueDates();

    return NextResponse.json({
      success: true,
      cycleSummary,
      syncSummary,
    });
  } catch (error) {
    console.error("Vercel cron execution failed:", error);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
