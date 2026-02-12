
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getClients,
  getInvoiceById,
} from '../services/invoiceService';
import { Invoice, Client } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceDetail from '../components/InvoiceDetail';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchInvoicesAndClients = useCallback(() => {
    setInvoices(getInvoices());
    setClients(getClients());
  }, []);

  useEffect(() => {
    fetchInvoicesAndClients();
  }, [fetchInvoicesAndClients]);

  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'total'>) => {
    const newInvoice = addInvoice(newInvoiceData);
    setInvoices(prev => [...prev, newInvoice]);
  };

  const handleUpdateInvoice = (updatedInvoiceData: Invoice) => {
    const updated = updateInvoice(updatedInvoiceData);
    setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      setIsDetailModalOpen(false);
    }
  };

  const handleMarkPaidToggle = (id: string, isPaid: boolean) => {
    const invoiceToUpdate = invoices.find(inv => inv.id === id);
    if (invoiceToUpdate) {
      const updatedInvoice = { ...invoiceToUpdate, isPaid };
      handleUpdateInvoice(updatedInvoice);
      setViewingInvoice(updatedInvoice);
    }
  };

  const openCreateInvoiceModal = () => {
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  const openEditInvoiceModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const openInvoiceDetailModal = (invoiceId: string) => {
    const invoice = getInvoiceById(invoiceId);
    if (invoice) {
      setViewingInvoice(invoice);
      setIsDetailModalOpen(true);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'N/A';
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const client = clients.find(c => c.id === invoice.clientId);
      const clientName = client ? client.name.toLowerCase() : '';
      const invoiceNo = invoice.invoiceNumber.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = clientName.includes(searchLower) || invoiceNo.includes(searchLower);

      const matchesStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'paid'
          ? invoice.isPaid
          : !invoice.isPaid;

      const matchesStartDate = !startDate || new Date(invoice.issueDate) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(invoice.issueDate) <= new Date(endDate);

      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [invoices, clients, searchTerm, statusFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={openCreateInvoiceModal}>Create New Invoice</Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Invoice # or Client Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
            Clear Filters
          </Button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center bg-white shadow rounded-lg py-12 px-4 border border-gray-100">
          <p className="text-gray-500">No invoices match your search criteria.</p>
          {(searchTerm || statusFilter !== 'all' || startDate || endDate) && (
             // Fix: 'link' is not a valid variant of Button. Using 'ghost' with custom styling instead.
             <Button variant="ghost" className="mt-2 text-blue-600 hover:underline" onClick={clearFilters}>
               Reset filters
             </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => openInvoiceDetailModal(invoice.id)}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClientName(invoice.clientId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${invoice.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => openEditInvoiceModal(invoice)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleAddInvoice}
        editingInvoice={editingInvoice}
        clients={clients}
      />

      {viewingInvoice && (
        <InvoiceDetail
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          invoice={viewingInvoice}
          client={clients.find(c => c.id === viewingInvoice.clientId)}
          onEdit={openEditInvoiceModal}
          onDelete={handleDeleteInvoice}
          onMarkPaidToggle={handleMarkPaidToggle}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
