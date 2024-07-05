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

export const questions = {
    'Personal Interests': [
        'What are your favorite hobbies or activities?',
        'Are there any specific sports or games you enjoy playing or watching?',
        'Do you have any favorite books, movies, or TV shows?',
        'Are there any particular genres of music or artists you like?',
        'Do you have any favorite travel destinations or places you would like to visit?',
        'Are there any specific topics or subjects that you enjoy learning about?',
        'Do you have any favorite cuisines or types of food?',
        'Are there any social causes or organizations that you are passionate about?',
        'Do you have any favorite hobbies or activities that you enjoy doing with friends or family?',
        'Are there any specific skills or talents that you have developed or are interested in developing?',
    ],
    'Professional Background': [
        'What industry do you work in or have experience in?',
        'What is your current job role or profession?',
        'Are you satisfied with your current job or are you looking for new opportunities?',
        'Can you tell me about any specific skills or expertise you have developed in your professional career?',
        'Have you worked in any notable companies or organizations?',
        'Are there any specific certifications or qualifications you have obtained?',
        'Do you have any professional goals or aspirations?',
        'Are there any particular areas within your industry that you are interested in or passionate about?',
        'Have you attended any industry conferences, workshops, or training programs?',
        'Are there any professional communities or networks that you are a part of?',
        'Have you published any articles, papers, or contributed to any industry publications?',
    ],
    'Learning Goals': [
        'What are your current learning goals or objectives?',
        'Are there any specific skills or knowledge areas you want to develop?',
        'Do you have any career-related learning goals?',
        'Are there any specific subjects or topics you are interested in learning more about?',
        'Are you looking to acquire any certifications or qualifications?',
        'Do you prefer self-paced learning or structured courses?',
        'Are there any specific learning platforms or resources you prefer?',
        'Are you interested in learning through online courses, books, videos, or other mediums?',
        'Do you have any preferred learning methods or strategies?',
        'Are there any specific learning challenges or obstacles you are facing?',
    ],
    'Learning Style': [
        'How do you prefer to learn new information or skills?',
        'Do you prefer visual learning through videos, diagrams, or infographics?',
        'Are you more inclined towards reading and learning through written materials like articles or books?',
        'Do you enjoy hands-on learning experiences or interactive exercises?',
        'Are you comfortable with audio-based learning, such as podcasts or audiobooks?',
        'Do you prefer learning in a group setting or individually?',
        'Are you more motivated by structured learning programs or self-directed learning?',
        'Do you prefer learning through online platforms, in-person classes, or a combination of both?',
        'Are you open to experimenting with different learning methods or do you prefer sticking to a specific approach?',
        'Are there any specific tools or technologies that you find helpful for learning?',
    ],
    'Tech and Gadgets': [
        'Are you interested in technology and gadgets?',
        'What are some of your favorite devices or gadgets that you currently use?',
        'Do you have any preferred operating systems or software applications?',
        'Are there any specific emerging technologies or trends that you find intriguing?',
        'How do you stay updated with the latest tech news and developments?',
        'Have you ever tried experimenting with coding or programming?',
        'Are there any specific tech-related hobbies or projects that you enjoy working on?',
        'Do you have any favorite tech influencers or experts that you follow?',
        'Are there any particular areas within technology that you are passionate about or want to learn more about?',
        'Are you open to exploring new technologies and gadgets, or do you prefer sticking to what you are familiar with?',
    ],
};

const initializeAnswers = (questions) => {
    const initialAnswers = {};
    Object.keys(questions).forEach((category) => {
        initialAnswers[category] = {};
        questions[category].forEach((question) => {
            initialAnswers[category][question] = '';
        });
    });
    return initialAnswers;
};
export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const [profileData, setProfileData] = useState({});
    const [answers, setAnswers] = useState(initializeAnswers(questions));
    const [avatar, setAvatar] = useState();

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50003'
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

            console.log(profileData);
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
            // const cachedAnswers = localStorage.getItem('profileAnswers');
            // if (cachedAnswers) {
            //     setAnswers(JSON.parse(cachedAnswers));
            //     return; // Exit the function early
            // }

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
            // Check if data.answers is not empty and is an object
            if (data.answers && Object.keys(data.answers).length > 0) {
                setAnswers(data.answers);
                // Cache the fetched answers in local storage
                localStorage.setItem(
                    'profileAnswers',
                    JSON.stringify(data.answers)
                );
            } else {
                // Optionally, handle the case where no valid answers are fetched
                console.log(
                    'No valid answers fetched, keeping the current state.'
                );
            }
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
            const cachedProfileData = localStorage.getItem('profileData');
            if (cachedProfileData) {
                const profileData = JSON.parse(cachedProfileData);
                profileData.analysis = data.analysis;
                localStorage.setItem(
                    'profileData',
                    JSON.stringify(profileData)
                ); // Save back to local storage
            }

            setProfileData((prevProfileData) => ({
                ...prevProfileData,
                analysis: data.analysis,
            }));
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!idToken) return;
        loadProfile();
        getAnswers();
    }, [idToken]);

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
