import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 h-28 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded-md"></div>
              <div className="h-6 w-6 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-28 bg-slate-200 rounded-md"></div>
              <div className="h-2.5 w-16 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Sidebars Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 h-80 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-slate-200 rounded-md"></div>
            <div className="h-7 w-32 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-56 bg-slate-50 rounded-xl"></div>
        </div>

        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 h-80 space-y-3">
          <div className="h-5 w-36 bg-slate-200 rounded-md"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 h-72 space-y-4">
        <div className="h-5 w-44 bg-slate-200 rounded-md"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-50 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};
