import { prisma } from "@/lib/prisma";

function toUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

async function getAuthoritativeDueDate(clientId: number) {
  const openInvoice = await prisma.invoice.findFirst({
    where: {
      clientId,
      status: {
        in: ["pending", "overdue"],
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    select: {
      dueDate: true,
    },
  });

  if (openInvoice) {
    return openInvoice.dueDate;
  }

  const latestInvoice = await prisma.invoice.findFirst({
    where: { clientId },
    orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
    select: {
      dueDate: true,
    },
  });

  return latestInvoice?.dueDate ?? null;
}

export async function syncClientDueDate(clientId: number) {
  const dueDate = await getAuthoritativeDueDate(clientId);

  if (!dueDate) {
    return null;
  }

  return prisma.client.update({
    where: { id: clientId },
    data: { dueDate },
  });
}

export async function syncAllClientDueDates() {
  const clients = await prisma.client.findMany({
    select: { id: true },
  });

  let syncedCount = 0;

  for (const client of clients) {
    const updated = await syncClientDueDate(client.id);
    if (updated) {
      syncedCount += 1;
    }
  }

  return {
    clientsChecked: clients.length,
    clientsSynced: syncedCount,
  };
}

export async function runInvoiceGenerationCycle(runDate = new Date()) {
  const today = new Date(runDate);
  const clients = await prisma.client.findMany({
    where: { status: "active" },
    include: {
      invoices: {
        orderBy: { billingDate: "desc" },
      },
    },
  });

  let invoicesCreated = 0;
  let overdueMarked = 0;
  let dueDatesSynced = 0;

  for (const client of clients) {
    try {
      const lastInvoice = client.invoices[0];

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

      const nextBillingDate = new Date(anchorDate);
      nextBillingDate.setDate(nextBillingDate.getDate() + 1);

      let dueDate: Date;
      if (lastInvoice) {
        const lastDueDate = new Date(lastInvoice.dueDate);
        const lastDueDay = lastDueDate.getDate();

        let nextMonth = lastDueDate.getMonth() + 1;
        let nextYear = lastDueDate.getFullYear();
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }

        const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
        const day = Math.min(lastDueDay, maxDay);
        dueDate = new Date(nextYear, nextMonth, day);
      } else {
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

          invoicesCreated += 1;
        }
      }

      if (
        lastInvoice &&
        lastInvoice.status === "pending" &&
        new Date(lastInvoice.dueDate) < today
      ) {
        await prisma.invoice.update({
          where: { id: lastInvoice.id },
          data: { status: "overdue" },
        });
        overdueMarked += 1;
      }

      const syncedClient = await syncClientDueDate(client.id);
      if (syncedClient) {
        dueDatesSynced += 1;
      }
    } catch (err) {
      console.error(`Invoice cron error for client ${client.name}`, err);
    }
  }

  return {
    runAt: today.toISOString(),
    clientsProcessed: clients.length,
    invoicesCreated,
    overdueMarked,
    dueDatesSynced,
  };
}
