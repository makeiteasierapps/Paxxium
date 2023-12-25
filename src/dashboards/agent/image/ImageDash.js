import { useContext } from 'react';
import { ImageContext } from './ImageContext';
import DalleSettings from './DalleSettings';
import ImagePreview from './ImagePreview';
import ImageGallery from './ImageGallery';

import { Box } from '@mui/material';
const ImageDash = () => {
    const { imageRequest, imageUrl } = useContext(ImageContext);
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            gap={2}
        >
            <DalleSettings />
            {imageRequest && (
                <ImagePreview size={imageRequest.size}>
                    <img src={imageUrl} alt={imageRequest.prompt} />
                </ImagePreview>
            )}
            <ImageGallery />
        </Box>
    );
};

export default ImageDash;
