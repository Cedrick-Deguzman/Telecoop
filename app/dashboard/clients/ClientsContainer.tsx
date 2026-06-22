'use client';

import { useState } from 'react';
import ClientsTable from './components/ClientsTable';
import ClientSearch from './components/ClientSearch';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import { Client } from './types';
import { StatsSummary } from './components/StatsSummary';
import { useClients } from './hooks/useClients';
import { ClientsSkeleton } from '../components/PageSkeletons';
import { exportToCsv, formatExportDate } from '@/lib/exportToCsv';

export default function ClientsContainer() {
  const {
    clients,
    filteredClients,
    plans,
    napboxes,
    loading,
    search,
    setSearch,
    fetchClients,
  } = useClients();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* -------------------------------------------- */
  /* UI handlers                                  */
  /* -------------------------------------------- */

  const handleExport = () => {
    exportToCsv('clients', clients.map(c => ({
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone,
      'Plan': c.plan.name,
      'Status': c.status,
      'Monthly Fee (PHP)': c.monthlyFee,
      'Installation Date': formatExportDate(c.installationDate),
      'Napbox ID': c.napboxPort?.napboxId ?? '',
      'Port Number': c.napboxPort?.portNumber ?? '',
      'Port Status': c.napboxPort?.status ?? '',
    })));
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedClient(null);
    setShowEditModal(false);
  };

  /* -------------------------------------------- */
  /* Render                                       */
  /* -------------------------------------------- */

  if (loading) {
    return <ClientsSkeleton />;
  }

  return (
    <div>
      <ClientSearch
        search={search}
        onSearchChange={setSearch}
        onAdd={() => setShowAddModal(true)}
        onExport={handleExport}
      />

      <StatsSummary clients={clients} />

      <ClientsTable
        clients={filteredClients}
        napboxes={napboxes}
        onEdit={openEditModal}
        onView={(client) => console.log('View', client)}      // dummy handler
        onDelete={(clientId) => console.log('Delete', clientId)} // dummy handler
      />

      {showAddModal && (
        <AddClientModal
          plans={plans}
          napboxes={napboxes}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchClients}
        />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          plans={plans}
          napboxes={napboxes}
          onClose={closeEditModal}
          onSuccess={fetchClients}
        />
      )}
    </div>
  );
}
