import { resizeImage } from '../../dashboards/utils/resizeImage';

export const useImageProcessing = (backendUrl, uid) => {
    
    const resizeAndConvertImageToBlob = (image, width, height) => {
        return new Promise((resolve, reject) => {
            resizeImage(image, width, height, (resizedImageBlob) => {
                resolve(resizedImageBlob);
            });
        });
    };

    const uploadImageAndGetUrl = async (imageBlob) => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.png');

        try {
            const response = await fetch(`${backendUrl}/messages/utils`, {
                method: 'POST',
                headers: {
                    userId: uid,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            return data.fileUrl; // Return the image URL
        } catch (error) {
            throw new Error(`Image upload error: ${error.message}`);
        }
    };
  
    return { resizeAndConvertImageToBlob, uploadImageAndGetUrl };
  };