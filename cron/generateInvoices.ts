import cron from "node-cron";
import { runInvoiceGenerationCycle } from "@/lib/billing-cycle";

export function startInvoiceCron() {
  cron.schedule("* * * * *", async () => {
    console.log("Invoice cron running...");
    const summary = await runInvoiceGenerationCycle();
    console.log("Invoice cron summary:", summary);
  });
}
