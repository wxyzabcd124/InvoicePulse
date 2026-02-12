import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../types';
import { getClients, addClient, updateClient, deleteClient } from '../services/invoiceService';
import Button from '../components/ui/Button';
import ClientForm from '../components/ClientForm';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(() => {
    setClients(getClients());
  }, []);

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClient = (newClientData: Omit<Client, 'id'>) => {
    const newClient = addClient(newClientData);
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClientData: Client) => {
    const updated = updateClient(updatedClientData);
    setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This cannot be undone.')) {
      deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const openAddClientModal = () => {
    setEditingClient(null);
    setIsFormModalOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setIsFormModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Button onClick={openAddClientModal}>Add New Client</Button>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No clients added yet. Click "Add New Client" to get started!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => openEditClientModal(client)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClient(client.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={editingClient ? handleUpdateClient : handleAddClient}
        editingClient={editingClient}
      />
    </div>
  );
};

export default ClientsPage;
