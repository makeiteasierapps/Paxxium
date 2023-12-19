import FormControlLabel from '@mui/material/FormControlLabel';
import { useContext } from 'react';
import Carousel from 'react-spring-3d-carousel';
import { NewsContext } from '../NewsContext';
import NewsCard from './NewsCard';
import {
    AiSearchButton,
    SearchContainer,
    SearchField,
    SearchButton,
    CarouselContainer,
} from '../styledNewsComponents';

import { CustomGridLoader } from '../../../main/customLoaders';

import { Box, Checkbox } from '@mui/material';
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
                justifyContent: 'space-around',
                height: '80vh',
            }}
        >
            <SearchContainer id="search-container">
                <AiSearchButton
                    id="ai-fetch-news-button"
                    onClick={aiNewsFetch}
                    variant="contained"
                >
                    Let AI pick your news
                </AiSearchButton>
                <SearchField
                    id="search-field"
                    label="Search"
                    variant="outlined"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <SearchButton
                    id="search-button"
                    onClick={(event) => {
                        event.preventDefault();
                        fetchNewsData(query);
                    }}
                    variant="contained"
                >
                    Submit
                </SearchButton>
            </SearchContainer>
            <CarouselContainer id="carousel-container">
                {loading ? (
                    <CustomGridLoader />
                ) : newsData.length > 0 ? (
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
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
                            }
                            label="Hide read articles"
                        />
                        <Carousel
                            id="carousel"
                            slides={newsSlides}
                            goToSlide={slideIndex}
                        />
                    </>
                ) : (
                    <Box>No news data available</Box>
                )}
                <></>
            </CarouselContainer>
        </Box>
    );
};

export default NewsCarousel;
