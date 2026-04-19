const cloudinary = require('cloudinary').v2;

const normalizeEnvValue = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  // Remove accidental surrounding quotes/backticks copied from docs or .env snippets.
  if ((text.startsWith('"') && text.endsWith('"'))
    || (text.startsWith("'") && text.endsWith("'"))
    || (text.startsWith('`') && text.endsWith('`'))) {
    return text.slice(1, -1).trim();
  }

  return text;
};

const parseCloudinaryUrl = () => {
  const rawUrl = normalizeEnvValue(process.env.CLOUDINARY_URL);
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'cloudinary:') return null;

    const api_key = decodeURIComponent(parsed.username || '').trim();
    const api_secret = decodeURIComponent(parsed.password || '').trim();
    const cloud_name = (parsed.hostname || '').trim();

    if (!cloud_name || !api_key || !api_secret) {
      return null;
    }

    return { cloud_name, api_key, api_secret };
  } catch (error) {
    return null;
  }
};

const readCloudinaryCredentials = () => {
  const cloud_name = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = normalizeEnvValue(process.env.CLOUDINARY_API_KEY);
  const api_secret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET);

  if (cloud_name && api_key && api_secret) {
    return { cloud_name, api_key, api_secret };
  }

  return parseCloudinaryUrl();
};

const cloudinaryCredentials = readCloudinaryCredentials();

const isCloudinaryEnabled = () => Boolean(cloudinaryCredentials);

if (cloudinaryCredentials) {
  cloudinary.config({
    ...cloudinaryCredentials,
    secure: true,
  });
}

const uploadImage = async (filePath, folder = 'boztech/photos') => {
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary aktif degil. CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET veya CLOUDINARY_URL ayarlayin.');
  }

  let uploaded;

  try {
    uploaded = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
  } catch (error) {
    throw new Error(`Cloudinary yukleme basarisiz: ${error.message}`);
  }

  return {
    url: uploaded.secure_url,
    key: uploaded.public_id,
    bytes: uploaded.bytes,
  };
};

const deleteImage = async (publicId) => {
  if (!publicId || !isCloudinaryEnabled()) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  });
};

module.exports = {
  isCloudinaryEnabled,
  uploadImage,
  deleteImage,
};
