'use client';
import { useState, useEffect, useCallback } from 'react';
import { Installation, TechnicianOption } from '../types';
import { Plan, Napbox } from '@/app/dashboard/clients/types';

export function useInstallations() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [napboxes, setNapboxes] = useState<Napbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, techRes, plansRes, napboxesRes] = await Promise.all([
        fetch('/api/installations'),
        fetch('/api/technicians'),
        fetch('/api/plans'),
        fetch('/api/napboxes'),
      ]);
      const [instData, techData, plansData, napboxesData] = await Promise.all([
        instRes.json(), techRes.json(), plansRes.json(), napboxesRes.json(),
      ]);
      setInstallations(instData);
      setTechnicians(techData);
      setPlans(plansData);
      setNapboxes(napboxesData);
    } catch (err) {
      console.error('Failed to fetch installations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const filtered = installations.filter(i => {
    const name = i.prospectName ?? i.client?.name ?? '';
    const techName = i.technician?.name ?? '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      techName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return { installations, filtered, technicians, plans, napboxes, loading, search, setSearch, statusFilter, setStatusFilter, fetchAll };
}
