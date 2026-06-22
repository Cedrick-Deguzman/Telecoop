'use client';
import { useState, useEffect, useCallback } from 'react';
import { Technician } from '../types';

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/technicians');
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchTechnicians(); }, [fetchTechnicians]);

  const filtered = technicians.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.area ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return { technicians, filtered, loading, search, setSearch, fetchTechnicians };
}
