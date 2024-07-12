import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [size, setSize] = useState('1024x1024');
    const [quality, setQuality] = useState('Standard');
    const [style, setStyle] = useState('Vivid');
    const [imageRequest, setImageRequest] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [userPrompt, setUserPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);

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
            setImageList(imageArray);

            localStorage.setItem('imageList', JSON.stringify(imageArray));
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, uid, showSnackbar]);

    useEffect(() => {
        const cachedImageUrls = localStorage.getItem('imageList');
        if (cachedImageUrls) {
            setImageList(JSON.parse(cachedImageUrls));
            return;
        }
        if (!uid) {
            return;
        }

        fetchImages();
    }, [fetchImages, uid]);

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
                body: JSON.stringify({ image: image.url }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to save image. Server responded with: ${errorText}`
                );
            }

            const firebaseUrl = await response.text();
            const downloadedImage = {
                url: firebaseUrl,
            };
            setImageList([...imageList, downloadedImage]);
            localStorage.setItem(
                'imageList',
                JSON.stringify([...imageList, downloadedImage])
            );
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

            setImageList(imageList.filter((image) => image.path !== path));
            localStorage.setItem(
                'imageList',
                JSON.stringify(imageList.filter((image) => image.path !== path))
            );
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or delete error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const generateDalleImage = async (imageRequest) => {
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

            const imageUrl = await response.text();

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

    return (
        <ImageContext.Provider
            value={{
                size,
                setSize,
                quality,
                setQuality,
                style,
                setStyle,
                imageRequest,
                setImageRequest,
                generateDalleImage,
                imageUrl,
                setImageUrl,
                saveImage,
                imageList,
                userPrompt,
                setUserPrompt,
                deleteImage,
                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
