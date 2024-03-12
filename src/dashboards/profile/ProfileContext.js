import {
    useState,
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';

import 'react-image-crop/dist/ReactCrop.css';
import { AuthContext } from '../../auth/AuthContext';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { idToken } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({});
    const [analysis, setAnalysis] = useState(null);
    const [answers, setAnswers] = useState({});
    const [avatar, setAvatar] = useState();
    const [upImg, setUpImg] = useState();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50006'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const loadProfile = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });

            const data = await response.json();
            setProfileData(data);
            setAvatar(data.avatar_url);
        } catch (error) {
            console.log(error);
        }
    }, [backendUrl, idToken]);

    const getAnswers = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/questions`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
            });
            const data = await response.json();
            console.log(data);
            setAnswers(data.answers);
        } catch (error) {
            console.log(error);
        }
    }, [backendUrl, idToken]);

    const getAnalysis = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'GET',
                headers: {
                    Authorization: idToken,
                },
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
                avatar,
                setAvatar,
                upImg,
                setUpImg,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
