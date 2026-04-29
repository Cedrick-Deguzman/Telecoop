"use client";

import { Skeleton } from "@/app/components/ui/Skeleton";

function StatsRow({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${count === 6 ? "sm:grid-cols-2 lg:grid-cols-6" : count === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchActionRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

function FiltersRow() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

function TableSkeleton({
  columns,
  rows = 5,
  title,
}: {
  columns: number;
  rows?: number;
  title?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
      {title ? <Skeleton className="h-7 w-48 mb-6" /> : null}
      <div className="space-y-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="h-4 w-3/4" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-t border-gray-100 pt-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatsRow count={3} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-7 w-40 mb-6" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Skeleton className="h-7 w-40 mb-6" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Skeleton className="h-7 w-40 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientsSkeleton() {
  return (
    <div className="space-y-6">
      <SearchActionRow />
      <StatsRow count={3} />
      <TableSkeleton columns={8} rows={5} />
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full max-w-4xl" />
        <Skeleton className="h-4 w-3/4 max-w-3xl" />
      </div>
      <StatsRow count={6} />
      <FiltersRow />
      <TableSkeleton columns={8} rows={5} />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <StatsRow count={3} />
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>
      <TableSkeleton columns={9} rows={5} />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-28" />
      </div>
      <StatsRow count={3} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
            <div className="space-y-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <TableSkeleton columns={6} rows={5} title="Plan Performance" />
    </div>
  );
}

export function NapboxesSkeleton() {
  return (
    <div className="space-y-6">
      <StatsRow count={4} />
      <SearchActionRow />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
            <div className="space-y-3">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, statIndex) => (
                <Skeleton key={statIndex} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
