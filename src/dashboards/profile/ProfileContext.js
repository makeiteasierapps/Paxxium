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
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    }, [backendUrl, idToken, showSnackbar]);

    const getAnswers = useCallback(async () => {
        try {
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
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    }, [backendUrl, idToken, showSnackbar]);

    const getAnalysis = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis');
            }

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.log(error);
        }
    }, [backendUrl, idToken]);

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
            setAnalysis(data['analysis']);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };

    const updateUserProfile = async (profileData) => {
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

            showSnackbar('User profile updated', 'success');
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    };

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
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    };

    useEffect(() => {
        if (!idToken) {
            return;
        }
        getAnalysis();
        loadProfile();
        getAnswers();
    }, [loadProfile, getAnswers, idToken, getAnalysis]);

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
