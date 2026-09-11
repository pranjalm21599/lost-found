import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../types';
import {
  HelpCircle,
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
  AlertCircle
} from 'lucide-react';

export const ReportLostPage: React.FC = () => {
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

    if (!formData.item_name || !formData.description || !formData.event_date || !formData.contact_phone || !formData.contact_email) {
      setErrorMsg('Please complete all required fields (*).');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Lost Item
      const createdItem = await api.createItem('LOST', formData);

      // 2. Upload file if selected
      if (selectedFile) {
        try {
          await api.uploadFile(createdItem.id, selectedFile);
        } catch (uploadErr: any) {
          console.error('File upload issue:', uploadErr);
          toast.error('Item was reported, but file upload failed: ' + uploadErr.message);
        }
      }

      toast.success('Lost item report filed successfully!');
      navigate(`/items/${createdItem.id}`);
    } catch (err: any) {
      const message = err.message || 'Failed to submit lost item report.';
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
        <div className="p-6 sm:p-8 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
              Campus Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              REPORT LOST ITEM
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Provide thorough details so campus finders can recognize your item and return it quickly.
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
              id="lost-item-name"
              required
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="e.g. iPhone 13 in matte black case, Blue Herschel Backpack, Texas Instruments TI-84"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
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
                  id="lost-category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
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
                Campus Location Lost *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  name="location"
                  id="lost-location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
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

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              id="lost-description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Color, brand, scratches, stickers, wallpaper, keychain details, distinctive marks..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm leading-relaxed"
            />
          </div>

          {/* Date Lost & Time Lost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date Lost *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="event_date"
                  id="lost-event-date"
                  required
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Lost (Approximate)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  name="event_time"
                  id="lost-event-time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Additional Details (Room number, table, specific area)
            </label>
            <input
              type="text"
              name="additional_details"
              id="lost-additional-details"
              value={formData.additional_details}
              onChange={handleInputChange}
              placeholder="e.g. 2nd Floor Silent Study Section, Table #14 near the corner windows"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
          </div>

          {/* Contact Information */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Contact Information (Shared only with verified users)
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
                    id="lost-contact-phone"
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
                    id="lost-contact-email"
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
            <div className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-rose-400 transition-colors bg-slate-50/50 dark:bg-slate-850/40">
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
                  <FileText className="w-6 h-6 text-rose-500" />
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
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                    Click to select file
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Receipts, reference pictures, serial number document (Max 10MB)
                  </span>
                  <input
                    type="file"
                    id="lost-file-upload"
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
              id="submit-lost-report-btn"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : 'REPORT LOST ITEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
