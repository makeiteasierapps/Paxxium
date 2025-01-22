import { useCallback, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export const useFileUpload = () => {
    const { uid } = useContext(AuthContext);
    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const uploadFile = useCallback(
        async (files) => {
            try {
                
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append('files', file);
                });

                const response = await fetch(
                    `${backendUrl}/images/upload-context`,
                    {
                        method: 'POST',
                        body: formData,
                        headers: {
                            uid: uid,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const { files: uploadedFiles } = await response.json();
                return uploadedFiles;
            } catch (error) {
                console.error('File upload error:', error);
                throw error;
            }
        },
        [uid]
    );

    return { uploadFile };
};
