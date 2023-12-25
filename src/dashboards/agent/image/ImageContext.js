import { useState, createContext, useContext, useEffect } from 'react';
import { AuthContext, backendUrl } from '../../../auth/AuthContext';
export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [size, setSize] = useState('1024x1024');
    const [quality, setQuality] = useState('Standard');
    const [style, setStyle] = useState('Vivid');
    const [imageRequest, setImageRequest] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageList, setImageList] = useState([]);
    const { idToken } = useContext(AuthContext);

    useEffect(() => {
        if (!idToken) {
            return;
        }
        const fetchImages = async () => {
            try {
                const response = await fetch(`${backendUrl}/images/get_saved`, {
                    method: 'GET',
                    headers: {
                        Authorization: idToken,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                const urls = await response.json();

                const images = urls.map((url) => ({ url }));

                setImageList(images);
            } catch (error) {
                console.log(error);
            }
        };
        fetchImages();
    }, [idToken]);

    const addImage = async (image) => {
        try {
            const response = await fetch(`${backendUrl}/images/upload`, {
                method: 'POST',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ image: image.url }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            const firebaseUrl = await response.json();
            const downloadedImage = {
                url: firebaseUrl,
            };
            setImageList([...imageList, downloadedImage]);
        } catch (error) {
            console.log(error);
        }
    };

    const handleImageRequest = async (imageRequest) => {
        setImageRequest(imageRequest);
        try {
            const response = await fetch(`${backendUrl}/images/generate`, {
                method: 'POST',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(imageRequest),
            });
            const imageUrl = await response.json();
            setImageUrl(imageUrl);
            addImage({ url: imageUrl });
        } catch (error) {
            console.log(error);
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
                handleImageRequest,
                imageUrl,
                addImage,
                imageList,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
