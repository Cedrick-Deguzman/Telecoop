import cron from "node-cron";
import { prisma } from "@/lib/prisma";

export function startInvoiceCron() {
  cron.schedule("* * * * *", async () => {
    console.log("Cron running...");
    const today = new Date();

    const clients = await prisma.client.findMany({
      include: { invoices: { orderBy: { billingDate: "asc" } } }, // get all invoices
    });

    for (const client of clients) {
      if (client.status !== "active") {
        console.log(`Skipping inactive client: ${client.name}`);
        continue;
      }

      // Start from reactivatedAt, last invoice, or installationDate
      let startDate = client.reactivatedAt
        ? new Date(client.reactivatedAt)
        : client.invoices.length
        ? new Date(client.invoices[client.invoices.length - 1].billingDate)
        : new Date(client.installationDate);

      // Generate invoices month by month until today
      while (
        startDate.getFullYear() < today.getFullYear() ||
        (startDate.getFullYear() === today.getFullYear() &&
          startDate.getMonth() <= today.getMonth())
      ) {
        // Check if invoice exists for this month
        const exists = client.invoices.some((inv) => {
          const invDate = new Date(inv.billingDate);
          return (
            invDate.getFullYear() === startDate.getFullYear() &&
            invDate.getMonth() === startDate.getMonth()
          );
        });

        if (!exists) {
          const billingDate = new Date(startDate);
          await prisma.invoice.create({
            data: {
              clientId: client.id,
              billingDate,
              dueDate: new Date(billingDate.getTime() + 30 * 86400000),
              amount: client.monthlyFee,
              status: "pending",
            },
          });
          console.log(`Generated invoice for ${client.name}: ${billingDate.toDateString()}`);
        }

        // Move to next month
        startDate.setMonth(startDate.getMonth() + 1);
      }

      // Mark last invoice overdue if needed
      const lastInvoice = client.invoices[client.invoices.length - 1];
      if (lastInvoice && lastInvoice.status !== "paid" && new Date(lastInvoice.dueDate) < today) {
        await prisma.invoice.update({
          where: { id: lastInvoice.id },
          data: { status: "overdue" },
        });
        console.log(`Marked overdue: ${client.name}`);
      }
    }
  });
}
