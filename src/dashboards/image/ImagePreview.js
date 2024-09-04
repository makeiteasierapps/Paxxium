import React, { useContext, useState, useEffect } from 'react';
import { ImageContext } from '../../contexts/ImageContext';
import { Paper, CircularProgress, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const ImagePreview = () => {
    const {
        imageRequest,
        setImageRequest,
        imageUrl,
        saveImage,
        setImageUrl,
        setUserPrompt,
        isLoading,
    } = useContext(ImageContext);

    const [hover, setHover] = useState(false);

    const [width, height] = imageRequest?.size.split('x').map(Number) || [1, 1];
    const aspectRatio = width / height;

    const handleMouseEnter = () => {
        if (imageUrl) {
            setHover(true);
        }
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    const handleDelete = () => {
        setImageRequest(null);
        setImageUrl(null);
        setUserPrompt('');
    };

    const handleSave = () => {
        if (imageUrl) {
            saveImage({ url: imageUrl })
                .then(() => {
                    setUserPrompt('');
                    setImageRequest(null);
                    setImageUrl(null);
                })
                .catch((error) => {
                    console.error('Error saving image:', error);
                });
        }
    };

    return (
        <Paper
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                width: 300,
                height: 300 / aspectRatio,
                overflow: 'hidden',
                display: 'flex',
                position: 'relative',
            }}
            elevation={3}
        >
            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress size={50} />
                </div>
            )}
            {!isLoading && imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageRequest.prompt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                        console.error('Error loading image:', {
                            src: e.target.src,
                            error: e.target.error,
                            type: e.target.type,
                            message: e.target.message,
                            // Add any other properties of the error event that might be useful
                        });
                    }}
                />
            )}
            {hover && !isLoading && imageUrl && (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '10%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Tooltip title="Delete" placement="left">
                        <IconButton color="primary" onClick={handleDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Save" placement="right">
                        <IconButton color="primary" onClick={handleSave}>
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
        </Paper>
    );
};

export default ImagePreview;
