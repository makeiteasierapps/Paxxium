import { useState, useCallback, useEffect } from 'react';

export const useImageHandling = () => {
    const [image, setImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [image]);

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log(file);
            setImage(file);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        setImage(acceptedFiles[0]);
    }, []);

    const removeImage = () => {
        setImage(null);
        setImagePreviewUrl(null);
    };

    return {
        image,
        imagePreviewUrl,
        showOverlay,
        handleFileInput,
        onDrop,
        removeImage,
        setShowOverlay
    };
};