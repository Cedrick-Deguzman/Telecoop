import cron from "node-cron";
import { prisma } from "@/lib/prisma";

export function startInvoiceCron() {
  // Runs every 1 minute for testing
  cron.schedule("* * * * *", async () => {
    console.log("Cron running...");

    const today = new Date();

    const clients = await prisma.client.findMany({
      include: {
        invoices: { orderBy: { billingDate: "desc" }, take: 1 },
      },
    });

    for (const client of clients) {
      const lastInvoice = client.invoices[0];
      if (!lastInvoice) continue;

      // Next billing cycle
      const nextBilling = new Date(lastInvoice.billingDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      // Generate new invoice
      if (today >= nextBilling) {
        await prisma.invoice.create({
          data: {
            clientId: client.id,
            billingDate: nextBilling,
            dueDate: new Date(nextBilling.getTime() + 30 * 86400000),
            amount: client.monthlyFee,
            status: "pending",
          },
        });
        console.log(`Generated invoice for client ${client.name}`);
      }

      // Mark overdue
      if (
        lastInvoice.status !== "paid" &&
        new Date(lastInvoice.dueDate) < today
      ) {
        await prisma.invoice.update({
          where: { id: lastInvoice.id },
          data: { status: "overdue" },
        });
        console.log(`Marked overdue: ${client.name}`);
      }
    }
  });
}
