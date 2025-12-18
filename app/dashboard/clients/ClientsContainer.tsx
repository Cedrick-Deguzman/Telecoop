'use client';

import { useEffect, useMemo, useState } from 'react';
import ClientsTable from './components/ClientsTable';
import ClientSearch from './components/ClientSearch';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import { Client } from './types';
import { StatsSummary } from './components/StatsSummary';
import { useClients } from './hooks/useClients';

export default function ClientsContainer() {
  const {
    clients,
    filteredClients,
    plans,
    napboxes,
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

  return (
    <div>
      <ClientSearch
        search={search}
        onSearchChange={setSearch}
        onAdd={() => setShowAddModal(true)}
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
