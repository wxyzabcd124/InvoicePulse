import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id'> | Client) => void;
  editingClient?: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSubmit, editingClient }) => {
  const [client, setClient] = useState<Omit<Client, 'id' | 'clientId'> | Client>({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingClient) {
      setClient(editingClient);
    } else {
      setClient({ name: '', email: '', address: '', phone: '' });
    }
    setErrors({}); // Clear errors on open/edit
  }, [editingClient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClient(prev => ({ ...prev, [id]: value }));
    // Clear error for this field as user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!client.name.trim()) newErrors.name = 'Client Name is required.';
    if (!client.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!client.address.trim()) newErrors.address = 'Address is required.';
    if (!client.phone.trim()) newErrors.phone = 'Phone number is required.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(client);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClient ? 'Edit Client' : 'Add New Client'}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {editingClient ? 'Save Changes' : 'Add Client'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          id="name"
          label="Client Name"
          value={client.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={client.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Input
          id="address"
          label="Address"
          value={client.address}
          onChange={handleChange}
          error={errors.address}
          required
        />
        <Input
          id="phone"
          label="Phone"
          value={client.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />
      </form>
    </Modal>
  );
};

export default ClientForm;
