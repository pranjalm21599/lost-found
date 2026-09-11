import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Item } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  PackageSearch
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardItems() {
      try {
        const [lostRes, foundRes] = await Promise.all([
          api.getItems({ item_type: 'LOST', limit: 4 }),
          api.getItems({ item_type: 'FOUND', limit: 4 }),
        ]);
        setRecentLost(lostRes.items);
        setRecentFound(foundRes.items);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardItems();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.full_name || 'Student'}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Student ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{user?.student_id}</span> • Campus Portal
          </p>
        </div>
      </div>

      {/* Primary Action Section: "What happened?" with Big Prominent Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          What happened?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card: I LOST SOMETHING */}
          <Link
            to="/report/lost"
            id="card-lost-something"
            className="group relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-100/90 block mb-1">
                  Report Incident
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  🔴 I LOST SOMETHING
                </h3>
                <p className="mt-2 text-xs text-rose-100/80 leading-relaxed max-w-sm">
                  Misplaced your phone, ID card, earbuds, notebook, or keys? Report it now so campus finders can identify and return it to you.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur w-fit px-4 py-2 rounded-xl transition-colors">
                Start Lost Report <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            {/* Ambient decorative glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
          </Link>

          {/* Card: I FOUND SOMETHING */}
          <Link
            to="/report/found"
            id="card-found-something"
            className="group relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 block mb-1">
                  Good Samaritan
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  🟢 I FOUND SOMETHING
                </h3>
                <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed max-w-sm">
                  Found someone's item on campus? Post the details and where you left it so the verified owner can claim it safely.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur w-fit px-4 py-2 rounded-xl transition-colors">
                Start Found Report <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            {/* Ambient decorative glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
          </Link>
        </div>
      </div>

      {/* Quick Search Lost & Found Bar */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Quick Search Campus Lost &amp; Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Looking for a specific item reported on campus? Search by item name, keyword, or location.
        </p>
        <form onSubmit={handleQuickSearch} className="flex gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="dashboard-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. blue hydro flask, AirPods, calculus textbook)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            type="submit"
            id="dashboard-search-btn"
            className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Recent Lost Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Lost Items
            </h2>
          </div>
          <Link
            to="/search?item_type=LOST"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            View all lost reports <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLost.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lost items reported yet"
            description="If you have misplaced an item on campus, create a report to notify the campus community."
            action={{
              label: 'Report a Lost Item',
              onClick: () => navigate('/report/lost'),
            }}
          />
        )}
      </div>

      {/* Recent Found Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Found Items
            </h2>
          </div>
          <Link
            to="/search?item_type=FOUND"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            View all found items <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentFound.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No found items available"
            description="All found items have been successfully reunited or none have been submitted recently."
            action={{
              label: 'Report a Found Item',
              onClick: () => navigate('/report/found'),
            }}
          />
        )}
      </div>
    </div>
  );
};
