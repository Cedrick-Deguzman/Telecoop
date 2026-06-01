'use client';

import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { BillingRecord, MarkPaidPayload } from '../types';
import { formatCurrency } from '@/app/utils/format';

interface MarkPaidModalProps {
  invoice: BillingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  confirmMarkAsPaid: (payload: MarkPaidPayload) => Promise<boolean>;
}

export function MarkPaidModal({
  invoice,
  isOpen,
  onClose,
  onSuccess,
  confirmMarkAsPaid,
}: MarkPaidModalProps) {
  const [loading, setLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'bank'>('cash');

  if (!isOpen || !invoice) return null;

  const handleSubmit = async () => {
    setLoading(true);

    const success = await confirmMarkAsPaid({
      id: invoice.id,
      paymentMethod,
      referenceNumber: paymentMethod === 'gcash' || paymentMethod === 'bank' ? referenceNumber : undefined,
    });

    if (!success) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="shell-panel-strong w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <div>
            <p className="section-kicker">Payment Confirmation</p>
            <h2 className="mt-2 text-2xl text-slate-950">Mark invoice as paid</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Client</p>
            <p className="mt-1 font-semibold text-slate-950">{invoice.clientName}</p>
            <p className="mt-3 text-sm text-emerald-700">Amount</p>
            <p className="mt-1 text-3xl text-slate-950">{formatCurrency(invoice.amount)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'gcash' | 'bank')}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {(paymentMethod === 'gcash' || paymentMethod === 'bank') && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="Enter GCash/Bank reference number"
                required
              />
            </div>
          )}

          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <CreditCard size={18} className="mt-0.5 shrink-0" />
            <p>This will record the payment and mark the invoice as paid. The action remains the same as before.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
