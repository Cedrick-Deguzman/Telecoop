import { Client } from "../dashboard/clients/types";

// app/utils/payments.ts
export function getLastPayment(client: Client) {
  if (!client.payments || client.payments.length === 0) return 'No payments';
  const lastPayment = client.payments[client.payments.length - 1];
  return new Date(lastPayment.paymentDate).toLocaleDateString();
}
