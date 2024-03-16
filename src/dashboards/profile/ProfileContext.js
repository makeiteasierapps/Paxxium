import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';

import 'react-image-crop/dist/ReactCrop.css';
import { AuthContext } from '../../auth/AuthContext';
import { SnackbarContext } from '../../SnackbarContext';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const [profileData, setProfileData] = useState({});
    const [analysis, setAnalysis] = useState(null);
    const [answers, setAnswers] = useState({});
    const [avatar, setAvatar] = useState();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_PROFILE_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const updateAvatar = useCallback(
        async (formData) => {
            // send the FormData object to the server
            try {
                const response = await fetch(
                    `${backendUrl}/profile/update_avatar`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: idToken,
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
        [backendUrl, idToken, showSnackbar]
    );

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
                    Authorization: idToken,
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
    }, [backendUrl, idToken, showSnackbar]);

    const updateUserProfile = async (profileData) => {
        console.log('updateUserProfile', profileData);
        try {
            const response = await fetch(`${backendUrl}/profile/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
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
    };

    const getAnswers = useCallback(async () => {
        try {
            // Attempt to retrieve the answers from local storage first
            const cachedAnswers = localStorage.getItem('profileAnswers');
            if (cachedAnswers) {
                setAnswers(JSON.parse(cachedAnswers));
                return; // Exit the function early
            }

            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch answers');
            }

            const data = await response.json();
            setAnswers(data.answers);

            // Cache the fetched answers in local storage
            localStorage.setItem(
                'profileAnswers',
                JSON.stringify(data.answers)
            );
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    }, [backendUrl, idToken, showSnackbar]);

    const updateAnswers = async (answers) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) {
                throw new Error('Failed to update answers');
            }

            localStorage.setItem('profileAnswers', JSON.stringify(answers));
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    };

    const analyzeProfile = async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to analyze profile');
            }

            const data = await response.json();
            setAnalysis(data.analysis);
            const cachedProfileData = localStorage.getItem('profileData');
            if (cachedProfileData) {
                const profileData = JSON.parse(cachedProfileData);
                profileData.analysis = data.analysis;
                localStorage.setItem(
                    'profileData',
                    JSON.stringify(profileData)
                ); // Save back to local storage
            }
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!idToken) {
            return;
        }
        loadProfile();
        getAnswers();
    }, [loadProfile, getAnswers, idToken]);

    const handleAnswerChange = (category, question, answer) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [category]: {
                ...(prevAnswers[category] || {}),
                [question]: answer,
            },
        }));
    };

    return (
        <ProfileContext.Provider
            value={{
                profileData,
                setProfileData,
                answers,
                setAnswers,
                analyzeProfile,
                analysis,
                handleAnswerChange,
                getAnswers,
                loadProfile,
                avatar,
                setAvatar,
                updateAvatar,
                updateAnswers,
                updateUserProfile,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
