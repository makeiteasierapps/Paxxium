import { useState, useCallback, useEffect } from 'react';

export const useImageHandling = () => {
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            return () => URL.revokeObjectURL(url);
        }
    }, [image]);

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        if (file && isValidFile(file)) {
            setImage(file);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && isValidFile(file)) {
            setImage(file);
        }
    }, []);

    const isValidFile = (file) => {
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            console.error('Invalid file type');
            return false;
        }

        if (file.size > maxSize) {
            console.error('File is too large');
            return false;
        }

        return true;
    };

    const removeImage = () => {
        setImage(null);
    };

    return {
        image,
        handleFileInput,
        onDrop,
        removeImage,
    };
};
