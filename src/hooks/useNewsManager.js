import { useCallback, useEffect, useState, useContext } from 'react';
import { SnackbarContext } from '../contexts/SnackbarContext';
import { AuthContext } from '../contexts/AuthContext';

export const useNewsManager = () => {
    const [allNewsData, setAllNewsData] = useState([]);
    const [displayedNewsData, setDisplayedNewsData] = useState([]);
    const [readFilter, setReadFilter] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const deleteNewsArticle = (newsId) => {
        const updatedAllNews = allNewsData.filter((news) => news.id !== newsId);
        const updatedDisplayedNews = displayedNewsData.filter(
            (news) => news.id !== newsId
        );
        setAllNewsData(updatedAllNews);
        setDisplayedNewsData(updatedDisplayedNews);
        localStorage.setItem('newsData', JSON.stringify(updatedAllNews));
    };

    const markNewsAsRead = (newsId) => {
        const updatedAllNews = allNewsData.map((news) =>
            news.id === newsId ? { ...news, is_read: true } : news
        );
        const updatedDisplayedNews = displayedNewsData.map((news) =>
            news.id === newsId ? { ...news, is_read: true } : news
        );
        setAllNewsData(updatedAllNews);
        setDisplayedNewsData(updatedDisplayedNews);
        localStorage.setItem('newsData', JSON.stringify(updatedAllNews));
    };

    const toggleReadFilter = () => {
        const newReadFilter = !readFilter;
        setReadFilter(newReadFilter);
        const updatedDisplayedNews = newReadFilter
            ? allNewsData.filter((news) => !news.is_read)
            : allNewsData;
        setDisplayedNewsData(updatedDisplayedNews);
    };

    const loadNewsData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Attempt to retrieve the news data from local storage
            const cachedNewsData = localStorage.getItem('newsData');
            if (cachedNewsData) {
                const parsedNewsData = JSON.parse(cachedNewsData);
                // Optionally, check if the data is not outdated here
                // For simplicity, we're directly using the cached data
                setAllNewsData(parsedNewsData);
                setDisplayedNewsData(parsedNewsData);
            } else {
                // If no cached data, fetch from the backend
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
                setAllNewsData(data);
                setDisplayedNewsData(data);
                // Cache the fetched data in local storage
                localStorage.setItem('newsData', JSON.stringify(data));
            }
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
                setAllNewsData((currentNewsData) => {
                    // Merge the new data with the current news data
                    const updatedNewsData = [...newData, ...currentNewsData];

                    // Update the local storage with the merged data
                    localStorage.setItem(
                        'newsData',
                        JSON.stringify(updatedNewsData)
                    );

                    return updatedNewsData;
                });
                setDisplayedNewsData((currentNewsData) => {
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
                if (response.status === 404) {
                    const errorData = await response.json();
                    showSnackbar(errorData.message, 'warning');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            const data = await response.json();
            setAllNewsData((currentNewsData) => {
                // Merge the new data with the current news data
                const updatedNewsData = [...data, ...currentNewsData];

                // Update the local storage with the merged data
                localStorage.setItem(
                    'newsData',
                    JSON.stringify(updatedNewsData)
                );

                return updatedNewsData;
            });
            setDisplayedNewsData((currentNewsData) => {
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
    }, [uid]);

    return {
        fetchNewsData,
        aiNewsFetch,
        displayedNewsData,
        slideIndex,
        setSlideIndex,
        isLoading,
        deleteNewsArticle,
        markNewsAsRead,
        toggleReadFilter,
        readFilter,
        allNewsData,
    };
};
