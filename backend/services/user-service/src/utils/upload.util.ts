import cloudinary from '../config/cloudinary';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `draftio/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result.secure_url);
        else reject(new Error('Upload failed'));
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
  await cloudinary.uploader.destroy(`draftio/${publicId}`);
};
