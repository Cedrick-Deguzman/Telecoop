'use client';

import { useState } from 'react';
import { NapBox } from './types';
import { useNapBoxes } from './hooks/useNapboxes';

import { NapBoxesStats } from './components/NapBoxesStats';
import { NapBoxesSearch } from './components/NapBoxesSearch';
import { NapBoxesGrid } from './components/NapBoxesGrid';
import { PortsModal } from './components/PortsModal';
import { AddEditNapBoxModal } from './components/AddEditNapBoxModal';

export function NapBoxesContainer() {
  const {
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

  if (loading) return <p>Loading NAP Boxes...</p>;

  return (
    <div className="space-y-6">
      <NapBoxesStats stats={stats} />

      <NapBoxesSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onAdd={() => setShowAddEdit(true)}
      />

      <NapBoxesGrid
        napBoxes={filteredNapBoxes}
        onViewPorts={(nap) => {
          setSelectedNapBox(nap);
          setShowPorts(true);
        }}
      />

      {showPorts && selectedNapBox && (
        <PortsModal napBox={selectedNapBox} onClose={() => setShowPorts(false)} filteredNapBoxes='all' />
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
