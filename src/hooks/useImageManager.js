import { useEffect, useCallback, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

export const useImageManager = () => {
    const [userPrompt, setUserPrompt] = useState('');
    const [imageRequest, setImageRequest] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useSnackbar();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const fetchImages = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/images`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const imageArray = await response.json();
            console.log(imageArray);
            setImageList(imageArray);

            // Only store the image paths in localStorage
            localStorage.setItem('imageList', JSON.stringify(imageArray));
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, uid, showSnackbar]);

    const saveImage = async (image) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${backendUrl}/images/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ image: image.url, prompt: userPrompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to save image. Server responded with: ${errorText}`
                );
            }

            const data = await response.json();
            const savedImage = { path: data.path };
            setImageList((prevImageList) => {
                const updatedImageList = [...prevImageList, savedImage];
                localStorage.setItem(
                    'imageList',
                    JSON.stringify(updatedImageList)
                );
                return updatedImageList;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or save error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteImage = async (path) => {
        try {
            const response = await fetch(`${backendUrl}/images`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ path: path }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setImageList((prevImageList) => {
                const updatedImageList = prevImageList.filter(
                    (image) => image.path !== path
                );
                localStorage.setItem(
                    'imageList',
                    JSON.stringify(updatedImageList)
                );
                return updatedImageList;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or delete error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const generateImage = async (imageRequest) => {
        setImageRequest(imageRequest);
        try {
            const response = await fetch(`${backendUrl}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(imageRequest),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const imageUrl = await response.json();

            if (imageUrl) {
                setImageUrl(imageUrl);
            }
        } catch (error) {
            console.log(error);
            showSnackbar(
                `Network or generate error: ${error.message}`,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!uid) {
            return;
        }
        const cachedImageUrls = localStorage.getItem('imageList');
        if (cachedImageUrls) {
            setImageList(JSON.parse(cachedImageUrls));
            return;
        }
        fetchImages();
    }, [fetchImages, uid]);

    return {
        imageList,
        userPrompt,
        setUserPrompt,
        setIsLoading,
        isLoading,
        fetchImages,
        saveImage,
        deleteImage,
        generateImage,
        imageRequest,
        setImageRequest,
        imageUrl,
        setImageUrl,
    };
};
