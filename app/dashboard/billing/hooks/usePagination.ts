import { useState } from 'react';

export function usePagination<T>(
  items: T[],
  rowsPerPage: number
) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  return { currentPage: safeCurrentPage, setCurrentPage, paginatedItems, totalPages };
}
