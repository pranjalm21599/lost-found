import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Item, Claim, ItemMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { ClaimModal } from '../components/ClaimModal';
import { ReturnConfirmModal } from '../components/ReturnConfirmModal';
import { EmptyState } from '../components/EmptyState';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Building,
  Phone,
  Mail,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Download,
  Check,
  X as XIcon,
  ChevronRight
} from 'lucide-react';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const itemId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & States
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isMarkingReturned, setIsMarkingReturned] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    current_location: '',
    additional_details: '',
  });

  const loadData = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const itemData = await api.getItem(itemId);
      setItem(itemData);
      setEditFormData({
        description: itemData.description,
        current_location: itemData.current_location || '',
        additional_details: itemData.additional_details || '',
      });

      // Load claims if owner
      if (user && itemData.user_id === user.id) {
        try {
          const claimsData = await api.getItemClaims(itemId);
          setClaims(claimsData);
        } catch {}
      }

      // Load deterministic matches
      try {
        const matchesData = await api.getItemMatches(itemId);
        setMatches(matchesData);
      } catch {}
    } catch (err: any) {
      toast.error(err.message || 'Item not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [itemId, user?.id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <EmptyState
          title="Item Not Found"
          description="The requested campus lost & found record does not exist or may have been deleted."
          action={{
            label: 'Return to Search',
            onClick: () => navigate('/search'),
          }}
        />
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isLost = item.item_type === 'LOST';
  const firstFile = item.files && item.files.length > 0 ? item.files[0] : null;
  const isImage = firstFile && firstFile.file_type.startsWith('image/');
  const isPdf = firstFile && firstFile.file_type === 'application/pdf';

  const handleReturnConfirm = async () => {
    setIsMarkingReturned(true);
    try {
      const updated = await api.markReturned(itemId);
      setItem(updated);
      toast.success(`"${item.item_name}" marked as returned!`);
      setIsReturnModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item status.');
    } finally {
      setIsMarkingReturned(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) {
      return;
    }
    try {
      await api.deleteItem(itemId);
      toast.success('Report deleted successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete report.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateItem(itemId, editFormData);
      setItem(updated);
      setIsEditing(false);
      toast.success('Item details updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item details.');
    }
  };

  const handleClaimStatus = async (claimId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.updateClaimStatus(claimId, status);
      toast.success(`Claim ${status.toLowerCase()} successfully.`);
      // Reload claims & item status
      const updatedClaims = await api.getItemClaims(itemId);
      setClaims(updatedClaims);
      const updatedItem = await api.getItem(itemId);
      setItem(updatedItem);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update claim status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Report'}
            </button>
            <button
              onClick={handleDeleteItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Media / Photo */}
          <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-850 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            {isImage ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20 max-h-96 flex items-center justify-center">
                  <img
                    src={`/${firstFile.file_path}`}
                    alt={item.item_name}
                    className="w-full h-auto max-h-96 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <a
                  href={`/${firstFile.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open full resolution image
                </a>
              </div>
            ) : isPdf ? (
              <div className="flex flex-col items-center text-center p-8">
                <FileText className="w-16 h-16 text-rose-500 mb-3" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {firstFile.file_name}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PDF Document Attachment
                </span>
                <a
                  href={`/${firstFile.file_path}`}
                  download={firstFile.file_name}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8 text-slate-400">
                <Tag className="w-16 h-16 stroke-1 mb-2" />
                <span className="text-sm font-semibold">No Image Attached</span>
                <span className="text-xs text-slate-500 mt-1">
                  Refer to the detailed textual description
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Full Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isLost ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LOST ITEM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    FOUND ITEM
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'RETURNED'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                      : item.status === 'MATCHED'
                      ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  }`}
                >
                  Status: {item.status}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {item.item_name}
              </h1>

              {/* Edit Mode vs Display Mode */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {!isLost && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Current Physical Location
                      </label>
                      <input
                        type="text"
                        value={editFormData.current_location}
                        onChange={(e) => setEditFormData({ ...editFormData, current_location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Additional Details
                    </label>
                    <input
                      type="text"
                      value={editFormData.additional_details}
                      onChange={(e) => setEditFormData({ ...editFormData, additional_details: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      Description &amp; Identifying Details
                    </h2>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  {item.additional_details && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                        Specific Location Details:
                      </span>
                      {item.additional_details}
                    </div>
                  )}

                  {/* Metadata Specs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-400">Date:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {formatDate(item.event_date)}
                      </span>
                    </div>

                    {item.event_time && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-400">Time:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {item.event_time}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-400">{isLost ? 'Lost At:' : 'Found At:'}</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {item.location}
                      </span>
                    </div>

                    {!isLost && item.current_location && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Building className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-400">Current Location:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.current_location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Poster Info & Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Poster info */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>
                    Reported by{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.user?.full_name || 'Campus Student'}
                    </span>
                    {isAuthenticated && item.user?.student_id && (
                      <span className="ml-1 font-mono text-[11px] text-slate-400">
                        ({item.user.student_id})
                      </span>
                    )}
                  </span>
                </div>
                <span>{formatDate(item.created_at)}</span>
              </div>

              {/* Contact Information display (When authenticated) */}
              {isAuthenticated ? (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                      Direct Contact Information:
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-indigo-800 dark:text-indigo-300 font-medium">
                      {item.contact_phone && (
                        <a href={`tel:${item.contact_phone}`} className="flex items-center gap-1.5 hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          {item.contact_phone}
                        </a>
                      )}
                      {item.contact_email && (
                        <a href={`mailto:${item.contact_email}`} className="flex items-center gap-1.5 hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          {item.contact_email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* If Owner: Mark as returned */}
                  {isOwner && item.status !== 'RETURNED' && (
                    <button
                      type="button"
                      id="mark-returned-btn"
                      onClick={() => setIsReturnModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      ✓ MARK AS RETURNED
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Contact information and claim submissions require student sign in.</span>
                  </div>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Sign In to Contact
                  </Link>
                </div>
              )}

              {/* Claim Button for Found Items when NOT owner */}
              {!isLost && !isOwner && isAuthenticated && item.status !== 'RETURNED' && (
                <button
                  type="button"
                  id="claim-item-btn"
                  onClick={() => setIsClaimModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  I THINK THIS IS MINE (SUBMIT CLAIM)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Owner Claims Received Panel */}
      {isOwner && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Ownership Claims Received ({claims.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Review verification details submitted by campus claimants
            </span>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-3 pt-2">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {claim.claimant?.full_name || 'Claimant'}
                      </span>
                      <span className="font-mono text-slate-400">({claim.claimant?.student_id})</span>
                      <span className="text-slate-400">• {formatDate(claim.created_at)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          claim.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      "{claim.message}"
                    </p>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-1">
                      <span>Phone: {claim.claimant?.phone}</span>
                      <span>Email: {claim.claimant?.email}</span>
                    </div>
                  </div>

                  {claim.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleClaimStatus(claim.id, 'ACCEPTED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept Claim
                      </button>
                      <button
                        onClick={() => handleClaimStatus(claim.id, 'REJECTED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 transition-colors"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
              No ownership claims have been submitted for this item yet.
            </p>
          )}
        </div>
      )}

      {/* Smart Matching Section */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              POSSIBLE MATCHES ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Algorithmic category, location, and description matching
          </span>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {matches.map(({ item: matchedItem, score, reasons }) => (
              <div
                key={matchedItem.id}
                className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        matchedItem.item_type === 'LOST'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {matchedItem.item_type}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {score}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {matchedItem.item_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {matchedItem.description}
                  </p>

                  {/* Reasons list */}
                  <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    {reasons.map((r, i) => (
                      <div key={i} className="text-[11px] text-indigo-900 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/items/${matchedItem.id}`}
                  className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs inline-flex items-center justify-center gap-1"
                >
                  View Matched Item <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No possible matches found"
            description="Our matching engine has not detected any corresponding items with matching categories, locations, or keyword tokens yet."
          />
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        itemId={itemId}
        itemName={item.item_name}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimSubmitted={() => {
          loadData();
        }}
      />

      {/* Return Confirm Modal */}
      <ReturnConfirmModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleReturnConfirm}
        loading={isMarkingReturned}
        itemName={item.item_name}
      />
    </div>
  );
};
