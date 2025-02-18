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

            // Update localStorage with the new state
            localStorage.setItem('userInsight', JSON.stringify(newState));
            return newState;
        });
    }, []);

    const getUserInsight = useCallback(async () => {
        try {
            let data;
            const cachedUserInsight = localStorage.getItem('userInsight');
            if (cachedUserInsight) {
                data = JSON.parse(cachedUserInsight);
            } else {
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
                        data = await response.json();
                        localStorage.setItem(
                            'userInsight',
                            JSON.stringify(data)
                        );
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
            }
            console.log(data);
            setInsightUserData(data);
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
