'use client';

import { useEffect, useMemo, useState } from 'react';
import { Client, Plan, Napbox } from '../types';

interface UseClientsReturn {
  clients: Client[];
  filteredClients: Client[];
  plans: Plan[];
  napboxes: Napbox[];
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      await Promise.all([fetchClients(), fetchPlans(), fetchNapboxes()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [clientsRes, plansRes, napboxesRes] = await Promise.all([
          fetch('/api/clients/list'),
          fetch('/api/plans'),
          fetch('/api/napboxes'),
        ]);

        const [clientsData, plansData, napboxesData] = await Promise.all([
          clientsRes.json(),
          plansRes.json(),
          napboxesRes.json(),
        ]);

        setClients(clientsData);
        setPlans(plansData);
        setNapboxes(napboxesData);
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
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
    loading,
    search,
    setSearch,
    fetchClients,
    fetchPlans,
    fetchNapboxes,
    refreshAll,
  };
}
