'use client';

import { useMemo, useState } from "react";
import { Napbox, NapboxPort, Client } from "../types";

interface UseClientsPortsProps {
  napboxes: Napbox[];
  selectedClient?: Client | null;
}

export function useClientsPorts({ napboxes, selectedClient }: UseClientsPortsProps) {
  const [selectedNapboxId, setSelectedNapboxId] = useState<number | null>(
    selectedClient?.napboxPort?.napboxId ?? null
  );
  const [selectedPortNumber, setSelectedPortNumber] = useState<number | null>(
    selectedClient?.napboxPort?.portNumber ?? null
  );
  const availablePorts = useMemo<NapboxPort[]>(() => {
    if (!selectedNapboxId) {
      return [];
    }

    const napbox = napboxes.find((n) => n.id === selectedNapboxId);
    if (!napbox) {
      return [];
    }

    return napbox.ports.filter((p) => {
      if (!selectedClient) {
        return p.status === "available";
      }
      return (
        p.status === "available" ||
        p.clientId === selectedClient.id ||
        p.portNumber === selectedPortNumber
      );
    });
  }, [selectedNapboxId, napboxes, selectedClient, selectedPortNumber]);

  return {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  };
}
