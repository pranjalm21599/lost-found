import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Item } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import {
  GraduationCap,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Repeat2,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const [lostRes, foundRes] = await Promise.all([
          api.getItems({ item_type: 'LOST', limit: 3 }),
          api.getItems({ item_type: 'FOUND', limit: 3 }),
        ]);
        setRecentLost(lostRes.items);
        setRecentFound(foundRes.items);
      } catch (err) {
        console.error('Error loading recent items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-6">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Official University Campus Network</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Campus Lost &amp; Found
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-indigo-600 dark:text-indigo-400 max-w-2xl mx-auto">
            "Lost it? Report it. Found it? Return it."
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The dedicated single-purpose campus platform to quickly report missing student IDs, electronics, keys, and bags, verify legitimate ownership, and return items safely.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                id="hero-dashboard-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  id="hero-register-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
                >
                  Create Student Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  id="hero-login-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
            <Link
              to="/search"
              id="hero-search-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
              Search Public Board
            </Link>
          </div>

          {/* Key Value Points */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rapid Campus Reporting</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Log lost or found items with campus locations (Library, Hostel, Food Court) in under 60 seconds.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Verified Ownership</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Claimants provide verification info before contact information or item handoff is granted.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Match Engine</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated matching compares category, location, timing, and descriptive tokens to pair lost and found reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Items Section */}
      <section className="py-12 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Recent Lost */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recently Lost on Campus
                </h2>
              </div>
              <Link
                to="/search?item_type=LOST"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                View all lost items <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <CardGridSkeleton count={3} />
            ) : recentLost.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentLost.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No lost items reported recently.</p>
            )}
          </div>

          {/* Recent Found */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recently Found on Campus
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
              <CardGridSkeleton count={3} />
            ) : recentFound.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentFound.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No found items reported recently.</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Campus Lost &amp; Found Portal. Designed for University Students &amp; Staff.</p>
      </footer>
    </div>
  );
};
