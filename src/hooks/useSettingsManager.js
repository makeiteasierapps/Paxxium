import { useCallback, useState, useEffect } from 'react';

export const useSettingsManager = (backendUrl, uid, showSnackbar) => {
    const [profileData, setProfileData] = useState({});
    const [loadedAvatarImage, setLoadedAvatarImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadImageAsBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Failed to load avatar image:', error);
            return null;
        }
    };

    useEffect(() => {
        if (!profileData.avatar_path || !backendUrl) return;

        const imageUrl = `${backendUrl}/images/${profileData.avatar_path}`;

        loadImageAsBase64(imageUrl)
            .then((base64Data) => {
                setLoadedAvatarImage(base64Data);
            })
            .catch(() => {
                console.error('Failed to load avatar image');
                setLoadedAvatarImage(null);
            });
    }, [profileData.avatar_path, backendUrl]);

    const loadProfile = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile`, {
                method: 'GET',
                headers: { uid: uid, dbName: process.env.REACT_APP_DB_NAME },
            });

            if (!response.ok) throw new Error('Failed to load profile');

            const profileData = await response.json();
            setProfileData(profileData);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    }, [backendUrl, showSnackbar, uid]);

    const updateUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/profile/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user profile');
            }

            showSnackbar('User profile updated', 'success');
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
        setIsLoading(false);
    };

    const updateAvatar = useCallback(
        async (formData) => {
            try {
                const response = await fetch(
                    `${backendUrl}/profile/update_avatar`,
                    {
                        method: 'POST',
                        headers: {
                            uid: uid,
                            dbName: process.env.REACT_APP_DB_NAME,
                        },
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to update avatar');
                }

                const data = await response.json();

                // Update the userAvatarImg state
                setProfileData({ ...profileData, avatar_path: data.path });
            } catch (error) {
                showSnackbar(
                    `Network or fetch error: ${error.message}`,
                    'error'
                );
                console.error(error);
            }
        },
        [backendUrl, profileData, showSnackbar, uid]
    );

    useEffect(() => {
        if (!uid) {
            return;
        }
        loadProfile();
    }, [loadProfile, uid]);

    return {
        profileData,
        setProfileData,
        isLoading,
        loadedAvatarImage,
        setLoadedAvatarImage,
        updateUserProfile,
        updateAvatar,
    };
};
