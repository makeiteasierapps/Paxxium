import React from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import ReactCrop from 'react-image-crop';

import { styled } from '@mui/system';

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    backgroundColor: theme.palette.background.default
}));

const AvatarDialog = ({ open, handleClose, handleSave, imgSrc, crop, setCrop, setCompletedCrop, imgRef, onImageLoad }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <StyledDialogContent>
                {imgSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) =>
                            setCrop(percentCrop)
                        }
                        onComplete={(c) => setCompletedCrop(c)}
                    >
                        <img
                            ref={imgRef}
                            src={imgSrc}
                            alt="Crop me"
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                )}
            </StyledDialogContent>
            <StyledDialogActions>
                <Button variant="contained" onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </StyledDialogActions>
        </Dialog>
    );
};

export default AvatarDialog;