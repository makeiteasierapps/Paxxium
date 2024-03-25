import { useState, useContext } from 'react';
import { IconButton, Tooltip, Paper, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageContext } from './ImageContext';

const ImagePreview = ({ children }) => {
    const {
        imageRequest,
        setImageRequest,
        imageUrl,
        saveImage,
        setImageUrl,
        setUserPrompt,
        isLoading,
    } = useContext(ImageContext);
    const [width, height] = imageRequest.size.split('x').map(Number);
    const aspectRatio = width / height;
    const [hover, setHover] = useState(false);

    const handleMouseEnter = () => {
        if (imageUrl) {
            setHover(true);
        }
    };

    const handleDelete = () => {
        setImageRequest(null);
        setImageUrl(null);
        setUserPrompt('');
    };

    const handleSave = () => {
        saveImage({ url: imageUrl })
            .then(() => {
                setUserPrompt('');
                setImageRequest(null);
                setImageUrl(null);
            })
            .catch((error) => {
                console.error("Error saving image:", error);
            });
    };

    const handleMouseLeave = () => {
        setHover(false);
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
            {!isLoading && children}
            {hover && !isLoading && (
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
