import { useCallback, useEffect, useState } from 'react';

export const useNewsManager = (uid, showSnackbar, backendUrl) => {
    const [newsDataArray, setNewsDataArray] = useState([]);
    const [readFilter, setReadFilter] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const deleteNewsArticle = async (newsId) => {
        try {
            const response = await fetch(`${backendUrl}/news`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ articleId: newsId }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            setNewsDataArray((prevNewsDataArray) => {
                const updatedDisplayedNews = prevNewsDataArray.filter(
                    (news) => news._id !== newsId
                );
                return updatedDisplayedNews;
            });
        } catch (error) {
            console.error(error);
            throw new Error('Error deleting news article');
        }
    };

    const markNewsAsRead = async (newsId, isRead) => {
        try {
            const response = await fetch(`${backendUrl}/news`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ articleId: newsId, isRead }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            setNewsDataArray((prevNewsDataArray) => {
                const updatedDisplayedNews = prevNewsDataArray.map((news) =>
                    news._id === newsId ? { ...news, is_read: isRead } : news
                );

                return readFilter
                    ? updatedDisplayedNews.filter((news) => !news.is_read)
                    : updatedDisplayedNews;
            });
        } catch (error) {
            console.error(error);
            throw new Error(
                `Error ${isRead ? 'marking' : 'unmarking'} news as read`
            );
        }
    };

    const toggleReadFilter = () => {
        setReadFilter((prevReadFilter) => !prevReadFilter);
    };

    const loadNewsData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/news`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load news data');
            }

            const data = await response.json();
            setNewsDataArray(data);
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, uid, showSnackbar]);

    const fetchNewsData = useCallback(
        async (queryParam) => {
            try {
                setIsLoading(true);
                const response = await fetch(`${backendUrl}/news`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({
                        query: queryParam,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const newData = await response.json();
                setNewsDataArray((currentNewsData) => {
                    const updatedNewsData = [...newData, ...currentNewsData];

                    return updatedNewsData;
                });
            } catch (error) {
                console.error(error);
                showSnackbar(
                    `Network or fetch error: ${error.message}`,
                    'error'
                );
            } finally {
                setIsLoading(false);
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const aiNewsFetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/ai-fetch-news`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setNewsDataArray((currentNewsData) => {
                const updatedNewsData = [...data, ...currentNewsData];

                return updatedNewsData;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, showSnackbar, uid]);

    useEffect(() => {
        if (!uid) {
            return;
        }
        loadNewsData();
    }, [loadNewsData, uid]);

    return {
        fetchNewsData,
        aiNewsFetch,
        newsDataArray,
        slideIndex,
        setSlideIndex,
        isLoading,
        deleteNewsArticle,
        markNewsAsRead,
        toggleReadFilter,
        readFilter,
    };
};
