import { useCallback, useState, useEffect } from 'react';

export const useSettingsManager = (backendUrl, uid, showSnackbar) => {
    const [profileData, setProfileData] = useState({});
    const [avatar, setAvatar] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            const cachedProfileData = localStorage.getItem('profileData');
            const data = cachedProfileData
                ? JSON.parse(cachedProfileData)
                : null;

            if (data) {
                setProfileData(data);
                setAvatar(data.avatar_url);
                return;
            }

            const response = await fetch(`${backendUrl}/profile`, {
                method: 'GET',
                headers: { uid: uid, dbName: process.env.REACT_APP_DB_NAME },
            });

            if (!response.ok) throw new Error('Failed to load profile');

            const profileData = await response.json();
            setProfileData(profileData);
            setAvatar(profileData.avatar_url);
            localStorage.setItem('profileData', JSON.stringify(profileData));
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

            localStorage.setItem('profileData', JSON.stringify(profileData));

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
                setAvatar(data.avatar_url);

                const cachedProfileData = localStorage.getItem('profileData');
                if (cachedProfileData) {
                    const profileData = JSON.parse(cachedProfileData);
                    profileData.avatar_url = data.avatar_url;
                    localStorage.setItem(
                        'profileData',
                        JSON.stringify(profileData)
                    );
                }
            } catch (error) {
                showSnackbar(
                    `Network or fetch error: ${error.message}`,
                    'error'
                );
                console.error(error);
            }
        },
        [backendUrl, showSnackbar]
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
        avatar,
        updateUserProfile,
        updateAvatar,
    };
};
