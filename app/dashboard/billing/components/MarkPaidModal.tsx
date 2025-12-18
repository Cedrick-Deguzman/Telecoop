'use client';

import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { BillingRecord } from '../types';
import { MarkPaidPayload } from '../types';

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
  const [paymentMethod, setPaymentMethod] =
    useState<'cash' | 'gcash' | 'bank'>('cash');

  if (!isOpen || !invoice) return null;

  const handleSubmit = async () => {
    setLoading(true);

    const success = await confirmMarkAsPaid({ 
      id: invoice.id, 
      paymentMethod, 
      referenceNumber: 
        paymentMethod === 'gcash' || paymentMethod === 'bank' ? referenceNumber : undefined });

    if (!success) {
      setLoading(false);
      return; // <-- stop here, warning modal will now appear
    }
    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Mark Invoice as Paid</h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Invoice Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Client</p>
            <p className="mb-2">{invoice.clientName}</p>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl text-green-600">₱{invoice.amount.toFixed(2)}</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as 'cash' | 'gcash' | 'bank'
                )
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg
                         focus:ring-2 focus:ring-indigo-500"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank">Bank Transfer</option>
            </select>
            {(paymentMethod === "gcash" || paymentMethod === "bank") && (
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter Gcash/Bank Reference No."
                  required
                />
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
            <CreditCard size={18} />
            <p>
              This action will record a payment and mark this invoice as paid.
              This cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white
                       hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
