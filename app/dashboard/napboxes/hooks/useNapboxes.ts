'use client';

import { useEffect, useState } from 'react';
import { NapBox, Port } from '../types';

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
          const occupiedPorts = napBox.ports.filter(p => p.status === 'occupied').length;
          const faultyPorts = napBox.ports.filter(
            p => p.status === 'faulty'
          ).length;

          return {
            ...napBox,
            occupiedPorts,
            faultyPorts,
            availablePorts:
              napBox.totalPorts - occupiedPorts - faultyPorts,
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
