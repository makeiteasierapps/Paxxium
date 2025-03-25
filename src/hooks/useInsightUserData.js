import { useCallback, useState, useEffect } from 'react';

export const useInsightUserData = ({
    uid,
    showSnackbar,
    socket,
    backendUrl,
}) => {
    const [insightUserData, setInsightUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const handleUpdatedUserData = (data) => {
        console.log('data', data);
        setInsightUserData(JSON.parse(data));
    };

    const updateQuestionData = useCallback((category, answerObject) => {
        setInsightUserData((prev) => {
            const newState = {
                ...prev,
                questions_data: {
                    ...prev.questions_data,
                    [category]: {
                        ...prev.questions_data[category],
                        [answerObject.subCategory]: prev.questions_data[
                            category
                        ][answerObject.subCategory].map((answer, idx) =>
                            idx === answerObject.index
                                ? { ...answer, answer: answerObject.answer }
                                : answer
                        ),
                    },
                },
            };
            return newState;
        });
    }, []);

    const getUserInsight = useCallback(async () => {
        try {
            try {
                const response = await fetch(`${backendUrl}/insight`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setInsightUserData(data);
                } else {
                    throw new Error('Failed to fetch user insight');
                }
            } catch (error) {
                showSnackbar(
                    `Network or fetch error: ${error.message}`,
                    'error'
                );
                console.error(error);
            }
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

    useEffect(() => {
        if (!socket) return;

        socket.on('insight_user_data', handleUpdatedUserData);

        return () => {
            socket.off('insight_user_data', handleUpdatedUserData);
        };
    }, [socket]);

    return {
        insightUserData,
        setInsightUserData,
        isLoading,
        updateQuestionData,
    };
};
