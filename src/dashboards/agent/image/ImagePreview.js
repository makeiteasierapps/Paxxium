import Paper from '@mui/material/Paper';

const ImagePreview = ({ children, size }) => {
    const [width, height] = size.split('x').map(Number);
    const aspectRatio = width / height;

    return (
        <Paper
            sx={{
                width: 300,
                height: 300 / aspectRatio,
                overflow: 'hidden',
                display: 'flex',
            }}
            elevation={3}
        >
            {children}
        </Paper>
    );
};

export default ImagePreview;
