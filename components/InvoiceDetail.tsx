import React from 'react';
import { Invoice, Client } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getSettings } from '../services/settingsService';

interface InvoiceDetailProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  client: Client | undefined;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onMarkPaidToggle: (id: string, isPaid: boolean) => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  isOpen,
  onClose,
  invoice,
  client,
  onEdit,
  onDelete,
  onMarkPaidToggle,
}) => {
  if (!invoice) return null;
  const settings = getSettings();

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Invoice</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo { max-width: 150px; max-height: 80px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-section div { width: 45%; }
        .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .item-table th, .item-table td { border-bottom: 1px solid #eee; padding: 12px 8px; text-align: left; vertical-align: top; }
        .item-table th { color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
        .description-cell { white-space: pre-wrap; word-break: break-word; max-width: 300px; }
        .totals-container { margin-left: auto; width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .grand-total { border-top: 2px solid #333; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 1.2em; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .paid { background: #dcfce7; color: #166534; }
        .unpaid { background: #fee2e2; color: #991b1b; }
        .discount-tag { font-size: 10px; color: #999; display: block; margin-top: 4px; }
      `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="invoice-container">');
      printWindow.document.write(`
        <div class="header">
          <div>
            ${settings.logo ? `<img src="${settings.logo}" class="logo" />` : `<h2 style="margin:0">${settings.name}</h2>`}
          </div>
          <div style="text-align: right">
            <h1 style="margin: 0; font-size: 24px; color: #1d4ed8;">INVOICE</h1>
            <p style="margin: 4px 0">#${invoice.invoiceNumber}</p>
            <div class="status-badge ${invoice.isPaid ? 'paid' : 'unpaid'}">${invoice.isPaid ? 'PAID' : 'UNPAID'}</div>
          </div>
        </div>

        <div class="info-section">
          <div>
            <h3 style="font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase;">From</h3>
            <p><strong>${settings.name}</strong></p>
            <p style="white-space: pre-wrap;">${settings.address}</p>
            <p>${settings.email}</p>
            <p>${settings.phone}</p>
          </div>
          <div>
            <h3 style="font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase;">Bill To</h3>
            <p><strong>${client?.name || 'N/A'}</strong></p>
            <p>${client?.address || 'N/A'}</p>
            <p>${client?.email || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Issue Date:</strong> ${invoice.issueDate}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center">Qty</th>
              <th style="text-align: right">Price</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => {
              const lineBase = item.quantity * item.unitPrice;
              const lineTotal = lineBase * (1 - (item.discount || 0) / 100);
              return `
                <tr>
                  <td class="description-cell">
                    <strong>${item.description.split('\n')[0]}</strong>
                    ${item.description.includes('\n') ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${item.description.split('\n').slice(1).join('\n')}</div>` : ''}
                    ${item.discount ? `<span class="discount-tag">Includes ${item.discount}% discount</span>` : ''}
                  </td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${settings.currency}${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right">${settings.currency}${lineTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="total-row"><span>Subtotal</span><span>${settings.currency}${invoice.subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>Tax (${(invoice.taxRate * 100).toFixed(2)}%)</span><span>${settings.currency}${invoice.taxAmount.toFixed(2)}</span></div>
          <div class="total-row grand-total"><span>Total</span><span>${settings.currency}${invoice.total.toFixed(2)}</span></div>
        </div>

        ${invoice.notes ? `<div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #888; text-transform: uppercase;">Notes</h4>
          <p style="font-size: 14px; white-space: pre-wrap;">${invoice.notes}</p>
        </div>` : ''}
      `);
      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoice.invoiceNumber}`}
      maxWidth="4xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={handlePrint}>Print / PDF</Button>
          <Button variant="secondary" onClick={() => onMarkPaidToggle(invoice.id, !invoice.isPaid)}>
            Mark as {invoice.isPaid ? 'Unpaid' : 'Paid'}
          </Button>
          <Button variant="secondary" onClick={() => onEdit(invoice)}>Edit</Button>
          <Button variant="danger" onClick={() => onDelete(invoice.id)}>Delete</Button>
        </>
      }
    >
      <div className="p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-6">
          <div className="flex items-center gap-6">
            {settings.logo && <img src={settings.logo} alt="Logo" className="h-20 w-auto object-contain bg-gray-50 p-2 rounded-lg" />}
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Invoice #{invoice.invoiceNumber}</h2>
              <div className="flex gap-4 mt-1">
                <p className="text-sm text-gray-500 font-medium">Issue: <span className="text-gray-900">{invoice.issueDate}</span></p>
                <p className="text-sm text-gray-500 font-medium">Due: <span className="text-red-600">{invoice.dueDate}</span></p>
              </div>
            </div>
          </div>
          <div className={`mt-4 md:mt-0 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-sm ${invoice.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {invoice.isPaid ? 'Paid' : 'Unpaid'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Service Provider</h3>
            <p className="font-black text-lg text-gray-900 mb-1">{settings.name}</p>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{settings.address}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm flex items-center gap-2"><span className="text-gray-400">@</span> {settings.email}</p>
              <p className="text-gray-600 text-sm flex items-center gap-2"><span className="text-gray-400">#</span> {settings.phone}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Billed To</h3>
            <p className="font-black text-lg text-gray-900 mb-1">{client?.name}</p>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{client?.address}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">{client?.email}</p>
              <p className="text-gray-600 text-sm">{client?.phone}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Description & Breakdown</th>
                <th className="px-4 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty</th>
                <th className="px-4 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {invoice.items.map((item) => {
                const lineBase = item.quantity * item.unitPrice;
                const lineTotal = lineBase * (1 - (item.discount || 0) / 100);
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">{item.description}</div>
                      {item.discount ? (
                        <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {item.discount}% discount
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-600 text-center font-medium">{item.quantity}</td>
                    <td className="px-4 py-5 text-sm text-gray-600 text-right font-medium">{settings.currency}{item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-5 text-sm font-black text-gray-900 text-right">{settings.currency}{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-full max-w-sm space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex justify-between text-sm text-gray-500 font-bold uppercase tracking-wider">
              <span>Subtotal:</span>
              <span className="text-gray-900">{settings.currency}{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-bold uppercase tracking-wider">
              <span>Global Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
              <span className="text-gray-900">{settings.currency}{invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
              <span className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Total Balance</span>
              <span className="text-3xl font-black text-blue-600">{settings.currency}{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h3 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2">Invoice Terms & Notes</h3>
            <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InvoiceDetail;