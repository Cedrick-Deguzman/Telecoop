'use client';

import { BillingRecord } from '../types';
import { X, AlertTriangle, FileText, User, Calendar } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <AlertTriangle className="text-white" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl text-white">Duplicate Reference Number</h2>
              <p className="text-red-100 text-sm">This reference has already been used</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Reference Number Display */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600 mb-1">Reference Number</p>
            <p className="text-2xl text-red-700 font-mono">{pendingPayment.referenceNumber}</p>
          </div>

          {/* Warning Message */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              This reference number has already been used for the following invoice(s):
            </p>
            <p className="text-sm text-gray-500">
              Please verify if this is correct before proceeding.
            </p>
          </div>

          {/* Invoice List */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-red-600" size={20} />
                    <span className="text-red-900">Invoice #{inv.id.toString().padStart(6, '0')}</span>
                  </div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                    Already Used
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="text-red-500" size={16} />
                    <div>
                      <p className="text-gray-500 text-xs">Client</p>
                      <p className="text-gray-900">{inv.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-red-500" size={16} />
                    <div>
                      <p className="text-gray-500 text-xs">Month</p>
                      <p className="text-gray-900">{inv.month}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-gray-500 text-xs">Amount</p>
                      <p className="text-gray-900">₱{inv.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-900 mb-1">Important Notice</p>
                <p className="text-sm text-amber-700">
                  Using duplicate reference numbers may cause confusion in payment tracking and reconciliation. 
                  Only proceed if you are certain this is correct.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all hover:border-gray-400 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel & Review
            </button>
            <button
              onClick={onProceed}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <AlertTriangle size={20} />
              Proceed Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
