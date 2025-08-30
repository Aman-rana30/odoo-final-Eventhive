import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath, folder = 'events') => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    use_filename: true,
    unique_filename: false
  });
};

export default cloudinary;
