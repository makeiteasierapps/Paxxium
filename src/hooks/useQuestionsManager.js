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

    const updateAnswers = async (answers) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
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
    };
};
