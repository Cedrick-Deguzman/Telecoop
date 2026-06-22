// Pure billing helpers — no Prisma, safe to import in client components

export function getFirstDueDate(installationDate: Date, billingDay: number): Date {
  const year = installationDate.getUTCFullYear();
  const month = installationDate.getUTCMonth();
  // First due date is always in the next calendar month
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = (month + 1) % 12;
  const maxDay = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
  const dueDay = Math.min(billingDay, maxDay);
  return new Date(Date.UTC(nextYear, nextMonth, dueDay));
}

export function getDaysOfService(installationDate: Date, firstDueDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((firstDueDate.getTime() - installationDate.getTime()) / msPerDay) + 1;
}

export function getProratedAmount(monthlyFee: number, daysOfService: number): number {
  return Math.round((monthlyFee / 30) * daysOfService * 100) / 100;
}
