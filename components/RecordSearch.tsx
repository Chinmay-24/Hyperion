'use client';

import { useState } from 'react';

interface RecordSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  recordType: string;
  dateFrom: string;
  dateTo: string;
}

export default function RecordSearch({ onSearch }: RecordSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    recordType: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const recordTypes = ['all', 'checkup', 'emergency', 'surgery', 'consultation', 'lab'];

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search medical records..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="glass-input w-full pl-12"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary px-6"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="glass-card px-4 hover:bg-white/10 transition-all"
        >
          {showFilters ? '✕' : '⚙️'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700 animate-fade-in">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Record Type</label>
            <select
              value={filters.recordType}
              onChange={(e) => setFilters({ ...filters, recordType: e.target.value })}
              className="glass-input w-full"
            >
              {recordTypes.map(type => (
                <option key={type} value={type} className="bg-slate-800">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="glass-input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="glass-input w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
