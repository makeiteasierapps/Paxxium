import {
    useState,
    createContext,
    useCallback,
    useContext,
    useEffect,
} from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { SnackbarContext } from '../../../SnackbarContext';

export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const [newsData, setNewsData] = useState([]);
    const [readFilter, setReadFilter] = useState(false);
    const [query, setQuery] = useState('');
    const [slideIndex, setSlideIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const backendUrl =
    process.env.NODE_ENV === 'development'
        ? `http://${process.env.REACT_APP_BACKEND_URL}`
        : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const updateNewsData = (updateFunc) =>
        setNewsData((prevNewsData) => updateFunc(prevNewsData));

    const deleteNewsArticle = (newsId) =>
        updateNewsData((prev) => prev.filter((news) => news.id !== newsId));

    const markNewsAsRead = (newsId) =>
        updateNewsData((prev) =>
            prev.map((news) =>
                news.id === newsId ? { ...news, is_read: true } : news
            )
        );

    const setUnreadNewsData = () =>
        updateNewsData((prev) => prev.filter((news) => !news.is_read));

    const loadNewsData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Attempt to retrieve the news data from local storage
            const cachedNewsData = localStorage.getItem('newsData');
            if (cachedNewsData) {
                const parsedNewsData = JSON.parse(cachedNewsData);
                // Optionally, check if the data is not outdated here
                // For simplicity, we're directly using the cached data
                setNewsData(parsedNewsData);
            } else {
                // If no cached data, fetch from the backend
                const response = await fetch(`${backendUrl}/news`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load news data');
                }

                const data = await response.json();
                setNewsData(data);
                // Cache the fetched data in local storage
                localStorage.setItem('newsData', JSON.stringify(data));
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, idToken, showSnackbar]);

    const fetchNewsData = useCallback(
        async (queryParam = query) => {
            try {
                setIsLoading(true);
                const response = await fetch(`${backendUrl}/news`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: JSON.stringify({
                        query: queryParam,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const newData = await response.json();
                setNewsData((currentNewsData) => {
                    // Merge the new data with the current news data
                    const updatedNewsData = [...newData, ...currentNewsData];

                    // Update the local storage with the merged data
                    localStorage.setItem(
                        'newsData',
                        JSON.stringify(updatedNewsData)
                    );

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
        [backendUrl, idToken, query, showSnackbar]
    );

    const aiNewsFetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/ai-fetch-news`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: idToken,
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
            setNewsData((currentNewsData) => {
                // Merge the new data with the current news data
                const updatedNewsData = [...data, ...currentNewsData];

                // Update the local storage with the merged data
                localStorage.setItem(
                    'newsData',
                    JSON.stringify(updatedNewsData)
                );

                return updatedNewsData;
            });
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, idToken, showSnackbar]);

    useEffect(() => {
        if (!idToken) return;
        loadNewsData();
    }, [idToken]);

    return (
        <NewsContext.Provider
            value={{
                newsData,
                setNewsData,
                query,
                setQuery,
                slideIndex,
                setSlideIndex,
                loadNewsData,
                fetchNewsData,
                aiNewsFetch,
                markNewsAsRead,
                setUnreadNewsData,
                readFilter,
                setReadFilter,
                deleteNewsArticle,
                isLoading,
            }}
        >
            {children}
        </NewsContext.Provider>
    );
};
