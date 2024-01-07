import { useContext } from 'react';
import Carousel from 'react-spring-3d-carousel';
import { NewsContext } from '../NewsContext';
import NewsCard from './NewsCard';
import {
    SearchContainer,
    SearchField,
    CarouselContainer,
} from '../styledNewsComponents';
import SearchIcon from '@mui/icons-material/Search';
import { CustomGridLoader } from '../../../main/customLoaders';
import {
    Box,
    Switch,
    IconButton,
    InputAdornment,
    Tooltip,
    Button,
} from '@mui/material';
const NewsCarousel = () => {
    const {
        newsData,
        query,
        setQuery,
        slideIndex,
        loadNewsData,
        fetchNewsData,
        aiNewsFetch,
        readFilter,
        setReadFilter,
        setUnreadNewsData,
        loading,
    } = useContext(NewsContext);

    const newsSlides = newsData.map((news, index) => ({
        key: news.id,
        content: <NewsCard news={news} index={index} />,
    }));

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: '100vh',
                gap: 2
            }}
        >
            <SearchContainer id="search-container">
                <Button
                    id="ai-fetch-news-button"
                    onClick={aiNewsFetch}
                    variant="contained"
                >
                    Let AI pick your news
                </Button>
                <SearchField
                    id="search-field"
                    label="Search"
                    variant="outlined"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    id="search-button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        fetchNewsData(query);
                                    }}
                                    disabled={!query}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </SearchContainer>
            <CarouselContainer id="carousel-container">
                {loading ? (
                    <CustomGridLoader />
                ) : newsData.length > 0 ? (
                    <Carousel
                        id="carousel"
                        slides={newsSlides}
                        goToSlide={slideIndex}
                    />
                ) : (
                    <Box>No news data available</Box>
                )}
            </CarouselContainer>
            <Box sx={{ display: 'flex' }}>
                <Tooltip
                    title={
                        readFilter ? 'Show all articles' : 'Hide read articles'
                    }
                    placement={readFilter ? 'right' : 'left'}
                >
                    <Switch
                        checked={readFilter}
                        onChange={(event) => {
                            setReadFilter(event.target.checked);
                            if (event.target.checked) {
                                setUnreadNewsData();
                            } else {
                                loadNewsData();
                            }
                        }}
                        name="readFilter"
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Box>
    );
};

export default NewsCarousel;
