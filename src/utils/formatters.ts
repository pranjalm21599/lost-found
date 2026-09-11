export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  let clean = filePath.trim();

  // Fix any previously corrupt path with leading slash before data: or blob: or http:
  if (clean.startsWith('/data:') || clean.startsWith('/blob:')) {
    clean = clean.slice(1);
  } else if (clean.startsWith('/http:') || clean.startsWith('/https:')) {
    clean = clean.slice(1);
  }

  // Base64 Data URLs and Blob URLs
  if (clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // Absolute URLs
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // Single slash relative URL
  if (clean.startsWith('/')) {
    return clean;
  }

  // Path relative to server root
  return `/${clean}`;
}
