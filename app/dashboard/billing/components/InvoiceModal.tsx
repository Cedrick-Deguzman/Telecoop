'use client';

import { useState } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { BillingRecord } from '../types';
import { formatCurrency, formatShortDate, formatPaymentMethod } from '@/app/utils/format';

interface InvoiceModalProps {
  invoice: BillingRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = async () => {
    const invoiceElement = document.getElementById('invoice-pdf');
    if (!invoiceElement) return;

    setDownloading(true);
    setDownloadError('');

    try {
      const htmlContent = invoiceElement.outerHTML;
      const response = await fetch('/api/billing/invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceHtml: htmlContent, fileName: `Invoice-${invoice.id}` }),
      });

      if (!response.ok) {
        setDownloadError('Failed to generate PDF. Please try again.');
        setDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        id="invoice-pdf"
        className="shell-panel-strong max-h-[90vh] w-full max-w-3xl overflow-y-auto p-8"
      >
        <div className="mb-8 flex flex-col gap-6 border-b border-slate-200/70 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">Invoice</p>
            <h2 className="mt-2 text-4xl text-slate-950">INV-{invoice.id.toString().padStart(6, '0')}</h2>
            <p className="mt-2 text-sm text-slate-500">Telecoop monthly internet service billing statement</p>
          </div>
          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#0b1f3b_0%,#173b72_100%)] px-6 py-5 text-right text-white shadow-lg">
            <p className="text-2xl">Telecoop</p>
            <p className="mt-2 text-sm text-slate-100">Internet Service Provider</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-200">
              Rm.3 2Flr Klir-Con Bldg., Rocka Complex, Rocka Ave., Tabang, Plaridel, Bulacan
            </p>
            <p className="text-sm text-slate-200">Plaridel, Philippines, 3004</p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 border-b border-slate-200/70 pb-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Bill To</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{invoice.clientName}</p>
            <p className="mt-1 text-sm text-slate-500">{invoice.email}</p>
            <p className="mt-4 text-sm text-slate-500">Client ID: {invoice.clientId}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Issue Date</p>
                <p className="mt-2 text-sm text-slate-900">{formatShortDate(invoice.billingDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Due Date</p>
                <p className="mt-2 text-sm text-slate-900">{formatShortDate(invoice.dueDate)}</p>
              </div>
              {invoice.paidDate && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Paid Date</p>
                  <p className="mt-2 text-sm text-emerald-700">{formatShortDate(invoice.paidDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quantity</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rate</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-t border-slate-200/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{invoice.plan}</p>
                  <p className="mt-1 text-sm text-slate-500">Monthly Internet Service</p>
                </td>
                <td className="px-5 py-4 text-right text-slate-700">1</td>
                <td className="px-5 py-4 text-right text-slate-700">{formatCurrency(invoice.amount)}</td>
                <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatCurrency(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <div className="ml-auto w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white/80 p-5">
            <div className="flex items-center justify-between py-2 text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm text-slate-600">
              <span>Tax (0%)</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-4">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Total</span>
              <span className="text-2xl text-slate-950">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {invoice.paidDate && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-600" size={20} />
              <span className="font-semibold text-emerald-900">Payment Received</span>
            </div>
            <p className="mt-2 text-sm text-emerald-800">
              Paid on {formatShortDate(invoice.paidDate)} via {formatPaymentMethod(invoice.paymentMethod)}
            </p>
          </div>
        )}

        <div className="mb-6 text-center text-sm text-slate-500">
          <p>Thank you for your business.</p>
          <p>For invoice questions, please contact +63 939-143-0094.</p>
        </div>

        {downloadError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {downloadError}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
            disabled={downloading}
          >
            <Download size={18} />
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
