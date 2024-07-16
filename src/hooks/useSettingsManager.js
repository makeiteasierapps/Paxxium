import { useCallback, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SnackbarContext } from '../contexts/SnackbarContext';

export const useSettingsManager = (backendUrl) => {
    const [profileData, setProfileData] = useState({});
    const [avatar, setAvatar] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const loadProfile = useCallback(async () => {
        try {
            // Attempt to retrieve the profile data from local storage
            const cachedProfileData = localStorage.getItem('profileData');
            if (cachedProfileData) {
                const data = JSON.parse(cachedProfileData);
                setProfileData(data);
                setAvatar(data.avatar_url);
                return; // Exit the function early as we've used cached data
            }

            // If no cached data, proceed to fetch from the backend
            const response = await fetch(`${backendUrl}/profile`, {
                method: 'GET',
                headers: {
                    uid: uid,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load profile');
            }

            const data = await response.json();

            setProfileData(data);
            setAvatar(data.avatar_url);

            // Cache the fetched profile data in local storage
            localStorage.setItem('profileData', JSON.stringify(data));
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
            // send the FormData object to the server
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

                // Update avatar_url in local storage
                const cachedProfileData = localStorage.getItem('profileData');
                if (cachedProfileData) {
                    const profileData = JSON.parse(cachedProfileData);
                    profileData.avatar_url = data.avatar_url; // Update the avatar_url
                    localStorage.setItem(
                        'profileData',
                        JSON.stringify(profileData)
                    ); // Save back to local storage
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
    }, [uid]);

    return {
        profileData,
        setProfileData,
        isLoading,
        avatar,
        updateUserProfile,
        updateAvatar,
    };
};
