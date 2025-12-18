'use client';

import { useEffect, useMemo, useState } from 'react';
import { Client, Plan, Napbox } from '../types';

interface UseClientsReturn {
  clients: Client[];
  filteredClients: Client[];
  plans: Plan[];
  napboxes: Napbox[];
  search: string;
  setSearch: (value: string) => void;
  fetchClients: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchNapboxes: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [napboxes, setNapboxes] = useState<Napbox[]>([]);
  const [search, setSearch] = useState('');

  /* -------------------------------------------- */
  /* Fetch functions                              */
  /* -------------------------------------------- */
  const fetchClients = async () => {
    const res = await fetch('/api/clients/list');
    setClients(await res.json());
  };

  const fetchPlans = async () => {
    const res = await fetch('/api/plans');
    setPlans(await res.json());
  };

  const fetchNapboxes = async () => {
    const res = await fetch('/api/napboxes');
    setNapboxes(await res.json());
  };

  const refreshAll = async () => {
    await Promise.all([fetchClients(), fetchPlans(), fetchNapboxes()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  /* -------------------------------------------- */
  /* Derived state                                */
  /* -------------------------------------------- */
  const filteredClients = useMemo(() => {
    const term = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
    );
  }, [clients, search]);

  return {
    clients,
    filteredClients,
    plans,
    napboxes,
    search,
    setSearch,
    fetchClients,
    fetchPlans,
    fetchNapboxes,
    refreshAll,
  };
}
