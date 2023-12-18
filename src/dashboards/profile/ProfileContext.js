import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';
import { AuthContext, backendUrl } from '../../auth/AuthContext';
import shaunoAvatar from '../../assets/images/shaunoAvatar.png';
import { readAndCompressImage } from 'browser-image-resizer';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { idToken } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({});
    const [analysis, setAnalysis] = useState(null);
    const [answers, setAnswers] = useState({});
    const [avatar, setAvatar] = useState(shaunoAvatar);

    const loadProfile = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
                credentials: 'include',
            });

            const data = await response.json();
            setProfileData(data);
            setAvatar(data.avatar_url);
        } catch (error) {
            console.log(error);
        }
    }, [idToken, setProfileData]);

    const getAnswers = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/questions`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
                credentials: 'include',
            });
            const data = await response.json();
            setAnswers(data.answers);
        } catch (error) {
            console.log(error);
        }
    }, [idToken, setAnswers]);

    const getAnalysis = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
                credentials: 'include',
            });
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.log(error);
        }
    }, [idToken]);

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

    const handleAvatarChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const img = event.target.files[0];
            const config = {
                quality: 0.5,
                maxWidth: 500,
                maxHeight: 500,
                autoRotate: true,
                debug: true,
            };

            try {
                const compressedImage = await readAndCompressImage(img, config);
                const reader = new FileReader();
                reader.onloadend = function () {
                    const base64data = reader.result;
                    setAvatar(base64data);
                };
                reader.readAsDataURL(compressedImage);

                const formData = new FormData();
                formData.append('compressedImage', compressedImage);

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
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleAnalyzeProfile = async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setAnalysis(data['analysis']);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                profileData,
                setProfileData,
                answers,
                setAnswers,
                handleAnalyzeProfile,
                analysis,
                handleAnswerChange,
                getAnswers,
                loadProfile,
                handleAvatarChange,
                avatar,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
