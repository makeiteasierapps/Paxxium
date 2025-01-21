import { useCallback } from 'react';

export const useFileUpload = () => {
    const uploadFile = useCallback(async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const { url } = await response.json();
            return url;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }, []);

    return { uploadFile };
};
