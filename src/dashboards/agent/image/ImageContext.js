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
    const [userPrompt, setUserPrompt] = useState('');
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
                });
                const imageArray = await response.json();

                setImageList(imageArray);
            } catch (error) {
                console.log(error);
            }
        };
        fetchImages();
    }, [idToken]);

    const saveImage = async (image) => {
        try {
            const response = await fetch(`${backendUrl}/images/upload`, {
                method: 'POST',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: image.url }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            const firebaseUrl = await response.text()
            const downloadedImage = {
                url: firebaseUrl,
            };
            setImageList([...imageList, downloadedImage]);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteImage = async (path) => {
        try {
            const response = await fetch(`${backendUrl}/images/delete`, {
                method: 'POST',
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(path),
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            if (response.status === 200) {
                setImageList(imageList.filter((image) => image.path !== path));
            }
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
                body: JSON.stringify(imageRequest),
            });
            const imageUrl = await response.text();
            setImageUrl(imageUrl);
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
                setImageUrl,
                saveImage,
                imageList,
                userPrompt,
                setUserPrompt,
                deleteImage,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
