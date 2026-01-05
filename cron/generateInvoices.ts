import cron from "node-cron";
import { prisma } from "@/lib/prisma";

function toUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function startInvoiceCron() {
  cron.schedule("* * * * *", async () => {
    console.log("Invoice cron running...");
    const today = new Date();

    const clients = await prisma.client.findMany({
      where: { status: "active" },
      include: {
        invoices: {
          orderBy: { billingDate: "desc" }, // latest first
        },
      },
    });

    for (const client of clients) {
      try {
        const lastInvoice = client.invoices[0];

        // Determine anchor date: last due date, reactivation, or installation
        let anchorDate: Date;
        if (
          client.reactivatedAt &&
          (!lastInvoice || new Date(client.reactivatedAt) > new Date(lastInvoice.dueDate))
        ) {
          anchorDate = new Date(client.reactivatedAt);
        } else if (lastInvoice) {
          anchorDate = new Date(lastInvoice.dueDate);
        } else {
          anchorDate = new Date(client.installationDate);
        }

        // Next billing starts the day after anchor date
        const nextBillingDate = new Date(anchorDate);
        nextBillingDate.setDate(nextBillingDate.getDate() + 1);

        // Determine due date
        let dueDate: Date;
        if (lastInvoice) {
          const lastDueDate = new Date(lastInvoice.dueDate);
          const lastDueDay = lastDueDate.getDate(); // 15 or 30

          // next month/year
          let nextMonth = lastDueDate.getMonth() + 1;
          let nextYear = lastDueDate.getFullYear();
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
          }

          // max day in that month
          const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
          const day = Math.min(lastDueDay, maxDay);

          dueDate = new Date(nextYear, nextMonth, day);
        } else {
          // fallback: 30th of next month
          let nextMonth = nextBillingDate.getMonth() + 1;
          let nextYear = nextBillingDate.getFullYear();
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
          }
          const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
          const day = Math.min(30, maxDay);
          dueDate = new Date(nextYear, nextMonth, day);
        }

        // Only create if billing date is today or earlier
        if (nextBillingDate <= today) {
          const exists = await prisma.invoice.findFirst({
            where: {
              clientId: client.id,
              billingDate: nextBillingDate,
            },
          });

          if (!exists) {
            await prisma.invoice.create({
              data: {
                clientId: client.id,
                billingDate: toUTC(nextBillingDate),
                dueDate: toUTC(dueDate),
                amount: client.monthlyFee,
                status: "pending",
              },
            });

            console.log(
              `Generated invoice for ${client.name}: Billing ${nextBillingDate.toDateString()} - Due ${dueDate.toDateString()}`
            );
          }
        }

        // Mark overdue if pending and past due
        if (lastInvoice && lastInvoice.status === "pending" && new Date(lastInvoice.dueDate) < today) {
          await prisma.invoice.update({
            where: { id: lastInvoice.id },
            data: { status: "overdue" },
          });
          console.log(`Marked overdue: ${client.name}`);
        }
      } catch (err) {
        console.error(`Invoice cron error for client ${client.name}`, err);
      }
    }
  });
}
