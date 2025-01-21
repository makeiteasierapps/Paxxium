import { useCallback } from 'react';

export const useImageHandling = ({ addContextItem }) => {
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

    const handleFile = useCallback(
        (file) => {
            if (file && isValidFile(file)) {
                addContextItem('file', file);
            }
        },
        [addContextItem]
    );

    const onDrop = useCallback(
        (acceptedFiles) => {
            handleFile(acceptedFiles[0]);
        },
        [handleFile]
    );

    // Can be used with event.target.files[0] from input element
    const onFileSelect = useCallback(
        (event) => {
            console.log(event.target.files);
            handleFile(event.target.files[0]);
        },
        [handleFile]
    );

    return {
        onDrop,
        onFileSelect,
    };
};
