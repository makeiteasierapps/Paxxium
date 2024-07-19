import { useCallback, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { questions } from '../assets/questions';

export const useQuestionsManager = (backendUrl) => {
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
    const [answers, setAnswers] = useState(initializeAnswers(questions));
    const [isLoading, setIsLoading] = useState(false);
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

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
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
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
    }, [backendUrl, showSnackbar, uid]);

    const analyzeAnsweredQuestions = async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to analyze profile');
            }

            const data = await response.json();
            console.log(data);
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

    const updateAnswers = async (node) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ node }),
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

    const generateFollowUpQuestions = async (userInput) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendUrl}/profile/generate_questions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({ userInput }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate follow-up questions');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        const result = JSON.parse(line);
                        console.log('Received question:', result);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating follow-up questions:', error);
            showSnackbar(
                `Error generating follow-up questions: ${error.message}`,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!uid) {
            return;
        }
        getAnswers();
    }, [getAnswers, uid]);

    const handleAnswerChange = (category, question, answer) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [category]: {
                ...(prevAnswers[category] || {}),
                [question]: answer,
            },
        }));
    };
    return {
        answers,
        handleAnswerChange,
        updateAnswers,
        questions,
        analyzeAnsweredQuestions,
        generateFollowUpQuestions,
        isLoading,
    };
};
