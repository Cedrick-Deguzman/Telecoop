import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function toUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isLastDayOfMonth(date: Date) {
  return date.getDate() === getLastDayOfMonth(date.getFullYear(), date.getMonth());
}

function getNextMonth(year: number, month: number) {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }

  return { year, month: month + 1 };
}

function getNextCycleDueDate(lastDueDate: Date) {
  const { year, month } = getNextMonth(lastDueDate.getFullYear(), lastDueDate.getMonth());
  const maxDay = getLastDayOfMonth(year, month);
  const dueDay = isLastDayOfMonth(lastDueDate)
    ? maxDay
    : Math.min(lastDueDate.getDate(), maxDay);

  return new Date(year, month, dueDay);
}

function getReactivationDueDate(billingDate: Date) {
  const { year, month } = getNextMonth(billingDate.getFullYear(), billingDate.getMonth());
  const maxDay = getLastDayOfMonth(year, month);
  const dueDay = billingDate.getDate() <= 15 ? 15 : maxDay;

  return new Date(year, month, dueDay);
}

async function getAuthoritativeDueDate(clientId: number) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { reactivatedAt: true },
  });
  const reactivatedAt = client?.reactivatedAt ? toUTC(new Date(client.reactivatedAt)) : null;

  const openInvoice = await prisma.invoice.findFirst({
    where: {
      clientId,
      status: {
        in: ["pending", "overdue"],
      },
      ...(reactivatedAt
        ? {
            billingDate: {
              gte: reactivatedAt,
            },
          }
        : {}),
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
    where: {
      clientId,
      ...(reactivatedAt
        ? {
            billingDate: {
              gte: reactivatedAt,
            },
          }
        : {}),
    },
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
  const today = toUTC(new Date(runDate));
  const overdueUpdate = await prisma.invoice.updateMany({
    where: {
      status: "pending",
      dueDate: { lt: today },
    },
    data: {
      status: "overdue",
    },
  });

  const clients = await prisma.client.findMany({
    where: { status: "active" },
    include: {
      invoices: {
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  let invoicesCreated = 0;
  let overdueMarked = overdueUpdate.count;
  let dueDatesSynced = 0;

  for (const client of clients) {
    try {
      const lastInvoice = client.invoices[0];
      const reactivatedAt = client.reactivatedAt ? toUTC(new Date(client.reactivatedAt)) : null;
      const isReactivatedCycle =
        !!reactivatedAt &&
        (!lastInvoice || reactivatedAt > toUTC(new Date(lastInvoice.dueDate)));

      let anchorDate: Date;
      if (isReactivatedCycle && reactivatedAt) {
        anchorDate = reactivatedAt;
      } else if (lastInvoice) {
        anchorDate = new Date(lastInvoice.dueDate);
      } else {
        anchorDate = new Date(client.installationDate);
      }

      const nextBillingDate = toUTC(addDays(anchorDate, 1));

      let dueDate: Date;
      if (isReactivatedCycle) {
        dueDate = getReactivationDueDate(nextBillingDate);
      } else if (lastInvoice) {
        dueDate = getNextCycleDueDate(new Date(lastInvoice.dueDate));
      } else {
        dueDate = getReactivationDueDate(nextBillingDate);
      }
      dueDate = toUTC(dueDate);

      if (nextBillingDate <= today) {
        const exists = await prisma.invoice.findUnique({
          where: {
            clientId_billingDate: {
              clientId: client.id,
              billingDate: nextBillingDate,
            },
          },
        });

        if (!exists) {
          try {
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
          } catch (err) {
            if (!isUniqueConstraintError(err)) {
              throw err;
            }
          }
        }
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
