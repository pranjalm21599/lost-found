import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Item } from '../types';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ReturnConfirmModal } from '../components/ReturnConfirmModal';
import {
  FileText,
  Trash2,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOST' | 'FOUND'>('LOST');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [selectedReturnItem, setSelectedReturnItem] = useState<Item | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const loadMyReports = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReports();
      setItems(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyReports();
  }, []);

  const filteredItems = items.filter((item) => item.item_type === activeTab);

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await api.deleteItem(itemId);
      toast.success('Report deleted successfully');
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete report');
    }
  };

  const handleReturnConfirm = async () => {
    if (!selectedReturnItem) return;
    setIsReturning(true);
    try {
      const updated = await api.markReturned(selectedReturnItem.id);
      toast.success(`"${selectedReturnItem.item_name}" marked as returned!`);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedReturnItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as returned');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Campus Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage all lost and found listings submitted under your student account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report/lost"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            to="/report/found"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          id="tab-lost-items"
          onClick={() => setActiveTab('LOST')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'LOST'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          MY LOST ITEMS ({items.filter((i) => i.item_type === 'LOST').length})
        </button>

        <button
          id="tab-found-items"
          onClick={() => setActiveTab('FOUND')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'FOUND'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          MY FOUND ITEMS ({items.filter((i) => i.item_type === 'FOUND').length})
        </button>
      </div>

      {/* Item List */}
      <div>
        {loading ? (
          <CardGridSkeleton count={3} />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const firstFile = item.files && item.files.length > 0 ? item.files[0] : null;
              const isImage = firstFile && firstFile.file_type.startsWith('image/');

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={`/${firstFile.file_path}`}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Tag className="w-10 h-10 text-slate-400" />
                    )}

                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm ${
                          item.item_type === 'LOST' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      >
                        {item.item_type}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'RETURNED'
                            ? 'bg-sky-500 text-white'
                            : item.status === 'MATCHED'
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-900/80 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                        {item.item_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reported {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        to={`/items/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-1">
                        {item.status !== 'RETURNED' && (
                          <button
                            type="button"
                            onClick={() => setSelectedReturnItem(item)}
                            title="Mark as Returned"
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Report"
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="You haven't reported any items yet."
            description={
              activeTab === 'LOST'
                ? "You haven't posted any lost item reports. If you've misplaced something on campus, report it now."
                : "You haven't posted any found item reports. If you've found an item on campus, help return it to its owner."
            }
            action={{
              label: activeTab === 'LOST' ? 'Report Lost Item' : 'Report Found Item',
              onClick: () => navigate(activeTab === 'LOST' ? '/report/lost' : '/report/found'),
            }}
          />
        )}
      </div>

      {/* Return Confirm Modal */}
      {selectedReturnItem && (
        <ReturnConfirmModal
          isOpen={!!selectedReturnItem}
          onClose={() => setSelectedReturnItem(null)}
          onConfirm={handleReturnConfirm}
          loading={isReturning}
          itemName={selectedReturnItem.item_name}
        />
      )}
    </div>
  );
};
