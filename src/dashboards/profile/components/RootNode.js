import React, { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { SettingsContext } from '../../../contexts/SettingsContext';
import {
    StyledRootNode,
    StyledShadowWrapper,
} from '../styledProfileComponents';

const RootNode = ({ onClick }) => {
    const { userAvatarImg, backendUrl } = useContext(SettingsContext);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const latestImageUrlRef = useRef('');

    useEffect(() => {
        if (userAvatarImg) {
            setIsLoading(true);
            const newImageUrl = userAvatarImg.startsWith('blob:')
                ? userAvatarImg
                : `${backendUrl}/images/${userAvatarImg}`;

            if (newImageUrl !== latestImageUrlRef.current) {
                const img = new Image();
                img.onload = () => {
                    setImageUrl(newImageUrl);
                    setIsLoading(false);
                    latestImageUrlRef.current = newImageUrl;
                };
                img.onerror = () => {
                    setIsLoading(false);
                    // Optionally set a fallback image or show an error state
                };
                img.src = newImageUrl;
            } else {
                setIsLoading(false);
            }
        }
    }, [userAvatarImg, backendUrl]);

    return (
        <StyledShadowWrapper>
            <StyledRootNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                }}
            />
        </StyledShadowWrapper>
    );
};

export default RootNode;
