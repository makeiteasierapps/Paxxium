import { useCallback, useState, useEffect } from 'react';

export const useQuestionsManager = (backendUrl, uid, showSnackbar) => {
    const [userInsight, setUserInsight] = useState({});
    const [activeCategory, setActiveCategory] = useState({});
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isQuestionsFormOpen, setIsQuestionsFormOpen] = useState(false);
    const [isGraphOpen, setIsGraphOpen] = useState(false);

    const updateAnswer = async (questionId, answer) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ questionId, answer }),
            });

            if (!response.ok) {
                throw new Error('Failed to update answers');
            }

            setUserInsight((prev) => {
              // Need to change this method, this will not work for the new design.
                const updated = prev.map((category) => ({
                    ...category,
                    questions: category.questions.map((question) =>
                        question._id === questionId
                            ? { ...question, answer }
                            : question
                    ),
                }));

                const updatedActiveCategory = updated.find(
                    (category) => category._id === activeCategory?._id
                );
                if (updatedActiveCategory) {
                    setActiveCategory(updatedActiveCategory);
                }

                localStorage.setItem('userInsight', JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };

    const generateBaseUserInsight = async (userInput) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendUrl}/insight/generate_questions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify(userInput),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate follow-up questions');
            }

            const data = await response.json();
            setUserInsight(data);

            localStorage.setItem('userInsight', JSON.stringify(data));
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

    const getUserInsight = useCallback(async () => {
        try {
            let data;
            const cachedUserInsight = localStorage.getItem('userInsight');
            if (cachedUserInsight) {
                data = JSON.parse(cachedUserInsight);
            } else {
                const response = await fetch(
                    `${backendUrl}/insight`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            uid: uid,
                            dbName: process.env.REACT_APP_DB_NAME,
                        },
                    }
                );
                data = await response.json();
                localStorage.setItem('userInsight', JSON.stringify(data));
            }
            setUserInsight(data);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, showSnackbar, uid]);

    useEffect(() => {
        if (!uid) return;
        setIsLoading(true);
        getUserInsight();
    }, [getUserInsight, uid]);

    return {
        updateAnswer,
        userInsight,
        setActiveCategory,
        activeCategory,
        activeQuestion,
        setActiveQuestion,
        generateBaseQuestions: generateBaseUserInsight,
        isLoading,
        isQuestionsFormOpen,
        isGraphOpen,
    };
};
