import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Item, CATEGORIES, CAMPUS_LOCATIONS } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [itemType, setItemType] = useState(searchParams.get('item_type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync state to URL & Fetch
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await api.getItems({
          q: query || undefined,
          item_type: itemType || undefined,
          category: category || undefined,
          location: location || undefined,
          status: status || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          limit: 9,
        });
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages || 1);
      } catch (err) {
        console.error('Failed to search items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [query, itemType, category, location, status, dateFrom, dateTo, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (itemType) params.set('item_type', itemType);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (status) params.set('status', status);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setQuery('');
    setItemType('');
    setCategory('');
    setLocation('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Search Campus Lost &amp; Found
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Search reports across all campus faculties, departments, and public areas.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        {/* Main query bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="search-page-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or description (e.g. blue backpack, iPhone, silver keys)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            type="submit"
            id="search-page-submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Item Type */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              id="filter-type"
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Types (Lost &amp; Found)</option>
              <option value="LOST">🔴 Lost Only</option>
              <option value="FOUND">🟢 Found Only</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Location
            </label>
            <select
              id="filter-location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MATCHED">Matched</option>
              <option value="RETURNED">Returned</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Date From
            </label>
            <input
              type="date"
              id="filter-date-from"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Date To
            </label>
            <input
              type="date"
              id="filter-date-to"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter bar actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Found <span className="font-bold text-slate-900 dark:text-white">{total}</span> items matching criteria
          </span>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No search results"
            description="We couldn't find any items matching your exact filter and keyword criteria."
            action={{
              label: 'Reset Filters',
              onClick: handleResetFilters,
            }}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            id="prev-page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
          </span>

          <button
            id="next-page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
