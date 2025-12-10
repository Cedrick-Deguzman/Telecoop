import { FC } from "react";
import { CheckCircle, Download } from "lucide-react";
import { BillingRecord, PaymentRecord } from "@/types/Billings";

export interface InvoiceModalProps {
  record: BillingRecord | PaymentRecord;
  onClose: () => void;
}

export const InvoiceModal: FC<InvoiceModalProps> = ({ record, onClose }) => {
  const isBillingRecord = (r: BillingRecord | PaymentRecord): r is BillingRecord => {
    return (r as BillingRecord).dueDate !== undefined;
  };

  const handleDownloadPDF = async () => {
    const invoice = document.getElementById("invoice-pdf");
    if (!invoice) return;

    const htmlContent = invoice.outerHTML;

    const response = await fetch("/api/billing/invoice-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceHtml: htmlContent, fileName: `Invoice-${record.id}` }),
    });

    if (!response.ok) return alert("Failed to generate PDF");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${record.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="invoice-pdf" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl mb-2">INVOICE</h2>
            <p className="text-gray-600">Invoice #INV-{record.id.toString().padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl text-red-900">Telecoop</p>
            <p className="text-sm text-gray-600">Internet Service Provider</p>
            <p className="text-sm text-gray-600">Rm.3 2Flr Klir-Con Bldg., Rocka Complex, Rocka Ave., Tabang, Plaridel, Bulacan</p>
            <p className="text-sm text-gray-600">Plaridel, Philippines, 3004</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
          <div>
            <p className="text-sm text-gray-600 mb-1">Bill To:</p>
            <p className="mb-1">{record.clientName}</p>
            <p className="text-sm text-gray-600">{record.email}</p>
            <p className="text-sm text-gray-600">Client ID: {record.clientId}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="text-sm text-gray-600">Issue Date</p>
              <p>{record.billingDate.split('T')[0]}</p>
            </div>
            {isBillingRecord(record) && (
            <>
                <div className="mb-2">
                <p className="text-sm text-gray-600">Due Date</p>
                <p>{record.dueDate.split('T')[0]}</p>
                </div>
                {record.paidDate && (
                <div>
                    <p className="text-sm text-gray-600">Paid Date</p>
                    <p className="text-green-600">{record.paidDate.split('T')[0]}</p>
                </div>
                )}
            </>
            )}
          </div>
        </div>

        {/* Invoice Items */}
        <table className="w-full mb-8">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-3 text-gray-600">Description</th>
              <th className="text-right py-3 text-gray-600">Quantity</th>
              <th className="text-right py-3 text-gray-600">Rate</th>
              <th className="text-right py-3 text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4">
                <p>{record.plan}</p>
                <p className="text-sm text-gray-600">Monthly Internet Service</p>
              </td>
              <td className="text-right py-4">1</td>
              <td className="text-right py-4">₱{record.amount.toFixed(2)}</td>
              <td className="text-right py-4">₱{record.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Invoice Totals */}
        <div className="mb-8">
          <div className="w-64 ml-auto">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>₱{record.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax (0%):</span>
              <span>₱0.00</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300">
              <span>Total:</span>
              <span className="text-2xl">₱{record.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {isBillingRecord(record) && record.status === 'paid' && record.paidDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">Payment Received</span>
            </div>
            <p className="text-sm text-green-700">
            Paid on {record.paidDate.split('T')[0]} via {record.paymentMethod}
            </p>
        </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, please contact +63 939-143-0094</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
