import { useContext } from 'react';
import { ImageContext } from '../../contexts/ImageContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import DalleSettings from './DalleSettings';
import ImagePreview from './ImagePreview';
import ImageGallery from './ImageGallery';
import MySnackbar from '../../SnackBar';

import { Box } from '@mui/material';
const ImageDash = () => {
    const { imageRequest, imageUrl } = useContext(ImageContext);
    const { snackbarInfo, hideSnackbar } = useContext(SnackbarContext);
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
                <ImagePreview>
                    <img src={imageUrl} alt={imageRequest.prompt} />
                </ImagePreview>
            )}
            <ImageGallery />
            <MySnackbar
                open={snackbarInfo.open}
                message={snackbarInfo.message}
                severity={snackbarInfo.severity}
                handleClose={hideSnackbar}
            />
        </Box>
    );
};

export default ImageDash;
