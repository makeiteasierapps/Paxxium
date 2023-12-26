import { useState, useContext } from 'react';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';
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
        saveImage({ url: imageUrl });
        setUserPrompt('');
        setImageRequest(null);
        setImageUrl(null);
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
            {children}
            {hover && (
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
