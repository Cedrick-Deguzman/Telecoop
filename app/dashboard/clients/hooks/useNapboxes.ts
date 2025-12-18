'use client';

import { useState, useEffect, useMemo } from 'react';
import { Napbox, NapboxPort, Client } from '../types';

interface UseNapboxesProps {
  napboxes: Napbox[];
  client?: Client; // optional, for editing existing client
}

interface UseNapboxesReturn {
  selectedNapboxId: number | null;
  setSelectedNapboxId: (id: number | null) => void;
  selectedPortNumber: number | null;
  setSelectedPortNumber: (port: number | null) => void;
  availablePorts: NapboxPort[];
}

export function useNapboxes({ napboxes, client }: UseNapboxesProps): UseNapboxesReturn {
  const [selectedNapboxId, setSelectedNapboxId] = useState<number | null>(
    client?.napboxPort?.napboxId ?? null
  );
  const [selectedPortNumber, setSelectedPortNumber] = useState<number | null>(
    client?.napboxPort?.portNumber ?? null
  );
  const [availablePorts, setAvailablePorts] = useState<NapboxPort[]>([]);

  useEffect(() => {
    if (!selectedNapboxId) {
      setAvailablePorts([]);
      return;
    }

    const napbox = napboxes.find((n) => n.id === selectedNapboxId);
    if (!napbox) {
      setAvailablePorts([]);
      return;
    }

    // Include only available ports or the current client's port
    const ports = napbox.ports.filter(
      (p) =>
        p.status === 'available' ||
        p.clientId === client?.id ||
        p.portNumber === selectedPortNumber
    );

    setAvailablePorts(ports);
  }, [selectedNapboxId, napboxes, client?.id, selectedPortNumber]);

  return {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  };
}
