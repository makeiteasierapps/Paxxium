import { useContext } from 'react';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { ImageContext } from './ImageContext';

const ImageGallery = () => {
    const { imageList } = useContext(ImageContext);
    return (
        <Box sx={{ width: '90%', height: '40%', overflowY: 'scroll' }}>
            <ImageList variant="masonry" cols={3} gap={8}>
                {imageList.map((image, idx) => (
                    <ImageListItem key={idx}>
                        <img
                            srcSet={image.url}
                            src={image.url}
                            alt={image.title}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Box>
    );
};

export default ImageGallery;
