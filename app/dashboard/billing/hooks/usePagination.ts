import { useState, useEffect } from 'react';

export function usePagination<T>(
  items: T[],
  rowsPerPage: number,
  dependencies: any[] = []
) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const totalPages = Math.ceil(items.length / rowsPerPage);

  return { currentPage, setCurrentPage, paginatedItems, totalPages };
}
