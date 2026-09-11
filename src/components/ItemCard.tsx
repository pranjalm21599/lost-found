import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';
import { formatDate, getFileUrl } from '../utils/formatters';
import {
  MapPin,
  Calendar,
  Tag,
  FileText,
  Package,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  matchScore?: number;
  highlightMatch?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, matchScore, highlightMatch }) => {
  const [imgError, setImgError] = useState(false);
  const isLost = item.item_type === 'LOST';
  const firstFile = item.files && item.files.length > 0 ? item.files[0] : null;
  const isImage =
    firstFile &&
    (firstFile.file_type.startsWith('image/') ||
      firstFile.file_path.startsWith('data:image') ||
      /\.(png|jpe?g|webp|gif|svg)$/i.test(firstFile.file_name));
  const isPdf = firstFile && firstFile.file_type === 'application/pdf';
  const fileUrl = firstFile ? getFileUrl(firstFile.file_path) : '';

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group relative flex flex-col bg-white dark:bg-slate-850 rounded-2xl border transition-all duration-200 overflow-hidden hover:shadow-lg ${
        highlightMatch
          ? 'border-indigo-400 dark:border-indigo-600 shadow-md shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Media / Thumbnail Section */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
        {isImage && !imgError ? (
          <img
            src={fileUrl}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-1.5 text-rose-500 dark:text-rose-400">
            <FileText className="w-12 h-12" />
            <span className="text-xs font-semibold uppercase tracking-wider">PDF Document</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <Package className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-medium tracking-wide">{item.category || 'Campus Item'}</span>
          </div>
        )}

        {/* Item Type Badge */}
        <div className="absolute top-3 left-3">
          {isLost ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm shadow-rose-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LOST
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              FOUND
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {item.status === 'RETURNED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500 text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Returned
            </span>
          ) : item.status === 'MATCHED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500 text-white shadow-sm">
              Matched
            </span>
          ) : null}
        </div>

        {/* Optional Match Score Pill */}
        {matchScore !== undefined && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/95 text-white backdrop-blur shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {matchScore}% Match
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.item_name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500 dark:text-slate-400">Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.category}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500 dark:text-slate-400">Location:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500 dark:text-slate-400">Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(item.event_date)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <Link
            to={`/items/${item.id}`}
            id={`view-details-${item.id}`}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-xs"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </div>
  );
};
