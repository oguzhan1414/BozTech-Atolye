const cloudinary = require('cloudinary').v2;

const isCloudinaryEnabled = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryEnabled()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const uploadImage = async (filePath, folder = 'boztech/photos') => {
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary aktif degil. CLOUDINARY_* degiskenlerini ayarlayin.');
  }

  const uploaded = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });

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
