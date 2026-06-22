'use client';

import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { BillingRecord } from '../types';
import { X, AlertTriangle, FileText, User, Calendar } from 'lucide-react';
import { formatCurrency } from '@/app/utils/format';

interface ReferenceWarningModalProps {
  invoices: BillingRecord[];
  pendingPayment: {
    paymentMethod: 'gcash' | 'bank';
    referenceNumber: string;
  };
  onCancel: () => void;
  onProceed: () => void;
}

export function ReferenceWarningModal({
  invoices,
  pendingPayment,
  onCancel,
  onProceed,
}: ReferenceWarningModalProps) {
  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 bg-slate-950/50 overflow-y-auto backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="shell-panel-strong max-h-[90vh] w-full max-w-2xl overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/15 p-2">
                <AlertTriangle size={26} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-red-100">Reference Check</p>
                <h2 className="mt-2 text-2xl">Duplicate reference number</h2>
                <p className="mt-1 text-sm text-red-100">This reference has already been used.</p>
              </div>
            </div>

            <button onClick={onCancel} className="rounded-xl border border-white/20 bg-white/10 p-2 transition hover:bg-white/15">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-700">Reference Number</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingPayment.referenceNumber}</p>
          </div>

          <div>
            <p className="text-base font-semibold text-slate-950">
              This reference number has already been used for the following invoice(s):
            </p>
            <p className="mt-1 text-sm text-slate-500">Please verify before proceeding with the same payment flow.</p>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 text-rose-800">
                    <FileText size={18} />
                    <span className="font-semibold">Invoice #{invoice.id.toString().padStart(6, '0')}</span>
                  </div>
                  <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    Already Used
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 text-rose-500" size={16} />
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Client</p>
                      <p className="mt-1 text-slate-900">{invoice.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 text-rose-500" size={16} />
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Month</p>
                      <p className="mt-1 text-slate-900">{invoice.month}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Amount</p>
                    <p className="mt-1 text-slate-900">{formatCurrency(invoice.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
              <div>
                <p className="font-semibold text-amber-900">Important Notice</p>
                <p className="mt-1 text-sm text-amber-800">
                  Using duplicate reference numbers may cause confusion in payment tracking and reconciliation. Only
                  proceed if you are certain this is correct.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel & Review
            </button>
            <button
              onClick={onProceed}
              className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
