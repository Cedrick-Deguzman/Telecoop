'use client';

import { useEffect, useState } from 'react';
import { NapBox } from '../types';

export function useNapBoxes() {
  const [napBoxes, setNapBoxes] = useState<NapBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchNapBoxes() {
      try {
        const res = await fetch('/api/napboxes');
        const data: NapBox[] = await res.json();

        const normalized = data.map(napBox => {
          const availablePorts = napBox.ports.filter(p => p.status === 'available').length;
          const occupiedPorts = napBox.ports.filter(p => p.status === 'occupied').length;
          const faultyPorts = napBox.ports.filter(p => p.status === 'faulty').length;
          const internalUsePorts = napBox.ports.filter(p => p.status === 'internal_use').length;
          const testLinePorts = napBox.ports.filter(p => p.status === 'test_line').length;

          return {
            ...napBox,
            availablePorts,
            occupiedPorts,
            faultyPorts,
            internalUsePorts,
            testLinePorts,
          };
        });

        setNapBoxes(normalized);
      } catch (err) {
        console.error('Failed to fetch napboxes', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNapBoxes();
  }, []);

  const filteredNapBoxes = napBoxes.filter(
    n =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalNapBoxes: napBoxes.length,
    totalPorts: napBoxes.reduce((s, n) => s + n.totalPorts, 0),
    totalAvailable: napBoxes.reduce((s, n) => s + n.availablePorts, 0),
    totalOccupied: napBoxes.reduce((s, n) => s + n.occupiedPorts, 0),
    totalReserved: napBoxes.reduce((s, n) => s + n.internalUsePorts + n.testLinePorts, 0),
  };

  return {
    napBoxes,
    filteredNapBoxes,
    loading,
    searchTerm,
    setSearchTerm,
    setNapBoxes,
    stats,
  };
}
