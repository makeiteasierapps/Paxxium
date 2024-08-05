import { useContext, useState } from 'react';
import { styled } from '@mui/system';
import Carousel from 'react-spring-3d-carousel';
import { NewsContext } from '../../../../contexts/NewsContext';
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

const StyledButton = styled(Button)(({ theme }) => ({
    fontFamily: 'Titillium Web, sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '40px',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

StyledButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};
const NewsCarousel = () => {
    const {
        newsDataArray,
        slideIndex,
        fetchNewsData,
        aiNewsFetch,
        isLoading,
        toggleReadFilter,
        readFilter,
    } = useContext(NewsContext);

    const [query, setQuery] = useState('');

    const newsSlides = newsDataArray.map((news, index) => ({
        key: news._id,
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
                gap: 2,
            }}
        >
            <SearchContainer id="search-container">
                <StyledButton
                    id="ai-fetch-news-button"
                    disabled={isLoading}
                    onClick={aiNewsFetch}
                >
                    Let AI pick your news
                </StyledButton>
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
                                        setQuery('');
                                    }}
                                    disabled={!query || isLoading}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </SearchContainer>
            <CarouselContainer id="carousel-container">
                {isLoading ? (
                    <CustomGridLoader />
                ) : newsDataArray.length > 0 ? (
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
                        onChange={toggleReadFilter}
                        name="readFilter"
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Box>
    );
};

export default NewsCarousel;
