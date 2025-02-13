import { useCallback, useState, useEffect } from 'react';

export const useInsightUserData = ({ uid, showSnackbar, socket, backendUrl }) => {
    const [insightUserData, setInsightUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const handleUpdatedUserData = (data) => {
        setInsightUserData(JSON.parse(data));
    };

    const getUserInsight = useCallback(async () => {
        try {
            // let data;
            // const cachedUserInsight = localStorage.getItem('userInsight');
            // if (cachedUserInsight) {
            //     data = JSON.parse(cachedUserInsight);
            // } else {
            //     const response = await fetch(`${backendUrl}/insight`, {
            //         method: 'GET',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             uid: uid,
            //             dbName: process.env.REACT_APP_DB_NAME,
            //         },
            //     });
            //     data = await response.json();
            //     localStorage.setItem('userInsight', JSON.stringify(data));
            // }
            // setInsightUserData(data);
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
    };
};
