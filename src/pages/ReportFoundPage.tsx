import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  Phone,
  Mail,
  Upload,
  X,
  ArrowLeft,
  AlertCircle,
  Building
} from 'lucide-react';

export const ReportFoundPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    item_name: '',
    category: CATEGORIES[0],
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '',
    location: CAMPUS_LOCATIONS[0],
    current_location: 'Campus Security Office / Help Desk',
    additional_details: '',
    contact_phone: user?.phone || '',
    contact_email: user?.email || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG, and PDF documents are supported.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !formData.item_name ||
      !formData.description ||
      !formData.event_date ||
      !formData.current_location ||
      !formData.contact_phone ||
      !formData.contact_email
    ) {
      setErrorMsg('Please complete all required fields (*).');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Found Item
      const createdItem = await api.createItem('FOUND', formData);

      // 2. Upload file if selected
      if (selectedFile) {
        try {
          await api.uploadFile(createdItem.id, selectedFile);
        } catch (uploadErr: any) {
          console.error('File upload issue:', uploadErr);
          toast.error('Item was reported, but file upload failed: ' + uploadErr.message);
        }
      }

      toast.success('Found item report filed successfully!');
      navigate(`/items/${createdItem.id}`);
    } catch (err: any) {
      const message = err.message || 'Failed to submit found item report.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              Campus Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              REPORT FOUND ITEM
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Thank you for helping keep campus honest. Record details so the rightful owner can verify and claim it.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              name="item_name"
              id="found-item-name"
              required
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="e.g. Set of 3 Dorm Keys with Red Lanyard, Grey Dell 65W USB-C Charger"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  name="category"
                  id="found-category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Location Found *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  name="location"
                  id="found-location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Current Item Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Item Location * (Where is the item right now?)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="current_location"
                id="found-current-location"
                required
                value={formData.current_location}
                onChange={handleInputChange}
                placeholder="e.g. Campus Security Office, Library 1st Floor Lost & Found Desk, In my custody"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Informing students where the item is physically deposited ensures secure collection.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              id="found-description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a general description. Tip: omit a small unique detail (like engraving or key count) to verify true owner claims."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
            />
          </div>

          {/* Date Found & Time Found */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date Found *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="event_date"
                  id="found-event-date"
                  required
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Found (Approximate)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  name="event_time"
                  id="found-event-time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Details (Bench, row, specific bench)
            </label>
            <input
              type="text"
              name="additional_details"
              id="found-additional-details"
              value={formData.additional_details}
              onChange={handleInputChange}
              placeholder="e.g. Left on table 4 at the main student cafeteria after lunch rush"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Contact Information */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Finder Contact Information (Protected &amp; verified)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Phone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="contact_phone"
                    id="found-contact-phone"
                    required
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="contact_email"
                    id="found-contact-email"
                    required
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photo / Document Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Photo / Document (PNG, JPG, JPEG, PDF up to 10MB)
            </label>
            <div className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-emerald-400 transition-colors bg-slate-50/50 dark:bg-slate-850/40">
              {filePreview ? (
                <div className="relative">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-48 rounded-xl object-contain shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : selectedFile ? (
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Click to select photo of found item
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Clear picture helps owners recognize their possessions (Max 10MB)
                  </span>
                  <input
                    type="file"
                    id="found-file-upload"
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              id="submit-found-report-btn"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : 'REPORT FOUND ITEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
