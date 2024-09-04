import { useContext } from 'react';
import { ImageContext } from '../../contexts/ImageContext';
import DalleSettings from './DalleSettings';
import ImagePreview from './ImagePreview';
import ImageGallery from './ImageGallery';

import { Box } from '@mui/material';

const ImageDash = () => {
    const { imageRequest } = useContext(ImageContext);
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
            {imageRequest && <ImagePreview />}
            <ImageGallery />
        </Box>
    );
};

export default ImageDash;