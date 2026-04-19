const getForwardedValue = (value) => {
  if (Array.isArray(value)) return value[0] || '';
  return String(value || '').split(',')[0].trim();
};

const getRequestOrigin = (req) => {
  const protocol = getForwardedValue(req.headers['x-forwarded-proto']) || req.protocol || 'http';
  const host = getForwardedValue(req.headers['x-forwarded-host']) || req.get('host') || '';
  return `${protocol}://${host}`.replace(/\/+$/, '');
};

const buildUploadUrl = (req, filename, folder = 'photos') => {
  if (!filename) return '';
  return `${getRequestOrigin(req)}/uploads/${folder}/${filename}`;
};

const resolveUploadUrl = (req, rawUrl, filename, folder = 'photos') => {
  if (filename) {
    return buildUploadUrl(req, filename, folder);
  }

  if (!rawUrl) return '';

  const origin = getRequestOrigin(req);
  const source = String(rawUrl).trim();

  if (source.startsWith('/uploads/')) {
    return `${origin}${source}`;
  }

  if (source.startsWith('uploads/')) {
    return `${origin}/${source}`;
  }

  try {
    const parsed = new URL(source);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${origin}${parsed.pathname}`;
    }
    return source;
  } catch (error) {
    const uploadsIndex = source.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      return `${origin}${source.slice(uploadsIndex)}`;
    }
    return source;
  }
};

module.exports = {
  getRequestOrigin,
  buildUploadUrl,
  resolveUploadUrl,
};
