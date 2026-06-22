'use client';

import { useState } from 'react';
import { NapBox } from './types';
import { useNapBoxes } from './hooks/useNapboxes';
import { exportToCsv, formatExportDate } from '@/lib/exportToCsv';

import { NapBoxesStats } from './components/NapBoxesStats';
import { NapBoxesSearch } from './components/NapBoxesSearch';
import { NapBoxesGrid } from './components/NapBoxesGrid';
import { PortsModal } from './components/PortsModal';
import { AddEditNapBoxModal } from './components/AddEditNapBoxModal';
import { NapboxesSkeleton } from '../components/PageSkeletons';

export function NapBoxesContainer() {
  const {
    napBoxes,
    filteredNapBoxes,
    loading,
    searchTerm,
    setSearchTerm,
    stats,
    setNapBoxes,
  } = useNapBoxes();

  const [selectedNapBox, setSelectedNapBox] = useState<NapBox | null>(null);
  const [showPorts, setShowPorts] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingNapBox, setEditingNapBox] = useState<NapBox | null>(null);

  if (loading) return <NapboxesSkeleton />;

  return (
    <div className="space-y-6">
      <NapBoxesStats stats={stats} />

      <NapBoxesSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onAdd={() => setShowAddEdit(true)}
        onExport={() => exportToCsv('napboxes', napBoxes.map(n => ({
          'Name': n.name,
          'Location': n.location,
          'Status': n.status,
          'Total Ports': n.totalPorts,
          'Available': n.availablePorts,
          'Occupied': n.occupiedPorts,
          'Faulty': n.faultyPorts,
          'Internal Use': n.internalUsePorts,
          'Test Line': n.testLinePorts,
          'Install Date': formatExportDate(n.installDate),
        })))}
      />

      <NapBoxesGrid
        napBoxes={filteredNapBoxes}
        onViewPorts={(nap) => {
          setSelectedNapBox(nap);
          setShowPorts(true);
        }}
      />

      {showPorts && selectedNapBox && (
        <PortsModal
          napBox={selectedNapBox}
          onClose={() => setShowPorts(false)}
          onUpdated={(updatedNapBox) => {
            setSelectedNapBox(updatedNapBox);
            setNapBoxes((prev) =>
              prev.map((napBox) => (napBox.id === updatedNapBox.id ? updatedNapBox : napBox))
            );
          }}
        />
      )}

      {showAddEdit && (
        <AddEditNapBoxModal
          napBox={editingNapBox}
          onClose={() => {
            setShowAddEdit(false);
            setEditingNapBox(null);
          }}
          onSaved={(napBox) => {
            setNapBoxes(prev =>
              editingNapBox
                ? prev.map(n => (n.id === napBox.id ? napBox : n))
                : [...prev, napBox]
            );
          }}
        />
      )}
    </div>
  );
}
