'use client';

import { useEffect, useState } from "react";
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
  const [availablePorts, setAvailablePorts] = useState<NapboxPort[]>([]);

  useEffect(() => {
     console.log("useEffect triggered");
     console.log("Selected Napbox ID:", selectedNapboxId);

    if (!selectedNapboxId) {
      console.log("No Napbox selected yet");
      setAvailablePorts([]);
      return;
    }
    console.log("Selected Napbox ID:", selectedNapboxId);
    const napbox = napboxes.find((n) => n.id === selectedNapboxId);
    console.log("Napbox object:", napbox);

    if (!napbox) {
      console.log("Napbox not found in array");
      setAvailablePorts([]);
      return;
    }

    console.log("All ports in this Napbox:", napbox.ports);
    
    // Only show ports that are available or currently assigned to this client
    const ports = napbox.ports.filter((p) => {
      if (!selectedClient) {
        // Add Client: show only available ports
        return p.status === "available";
      }
      // Edit Client: show available + assigned port
      return (
        p.status === "available" ||
        p.clientId === selectedClient.id ||
        p.portNumber === selectedPortNumber
      );
    });
    console.log("Available ports after filter:", ports);
    setAvailablePorts(ports);
  }, [selectedNapboxId, napboxes, selectedClient, selectedPortNumber]);

  return {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  };
}
