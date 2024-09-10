import { useContext, useState } from 'react';
import {
    ImageList,
    ImageListItem,
    ImageListItemBar,
    IconButton,
    Box,
} from '@mui/material/';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageContext } from '../../contexts/ImageContext';

const ImageGallery = () => {
    const { imageList, deleteImage, backendUrl } = useContext(ImageContext);
    const [hoverIndex, setHoverIndex] = useState(false);
    return (
        <Box sx={{ width: '90%', height: '40%', overflowY: 'scroll' }}>
            <ImageList variant="masonry" cols={3} gap={8}>
                {imageList.map((image, idx) => (
                    <ImageListItem
                        key={idx}
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <img
                            srcSet={image.url}
                            src={`${backendUrl}/images/${image.thumbnail}`}
                            alt={'Dalle'}
                            loading="lazy"
                        />
                        {hoverIndex === idx && (
                            <ImageListItemBar
                                position="top"
                                actionIcon={
                                    <IconButton
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.54)',
                                        }}
                                        onClick={() => deleteImage(image.path)}
                                        aria-label={`info about`}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            />
                        )}
                    </ImageListItem>
                ))}
            </ImageList>
        </Box>
    );
};

export default ImageGallery;
