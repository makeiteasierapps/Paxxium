import { Box, CircularProgress } from '@mui/material';
import { useContext, useState, useRef } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
    UserContainer,
    AvatarContainer,
    StyledAvatar,
    StyledButton,
    ProfileTextField,
    Username,
    TextFieldContainer,
    StyledAvatarPlaceholder,
} from '../profile/styledProfileComponents';

import AvatarDialog from '../settings/AvatarDialog';

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

const User = () => {
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef(null);
    const hiddenAnchorRef = useRef(null);
    const blobUrlRef = useRef('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [aspect, setAspect] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);

    const {
        profileData,
        setProfileData,
        selectedImage,
        setSelectedImage,
        updateAvatar,
        isLoading,
        updateUserProfile,
        backendUrl,
    } = useContext(SettingsContext);

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        if (imgSrc) {
            handleSaveCroppedImage();
        }
        setOpen(false);
    };

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    async function handleSaveCroppedImage() {
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const desiredWidth = 400;

        // Calculate the height to maintain aspect ratio
        const desiredHeight = desiredWidth / aspectRatio;

        const offscreen = new OffscreenCanvas(desiredWidth, desiredHeight);

        const ctx = offscreen.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            offscreen.width,
            offscreen.height
        );
        const blob = await offscreen.convertToBlob({
            type: 'image/png',
        });

        setSelectedImage(URL.createObjectURL(blob));
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = URL.createObjectURL(blob);
        if (hiddenAnchorRef.current) {
            hiddenAnchorRef.current.href = blobUrlRef.current;
            hiddenAnchorRef.current.click();
        }

        const formData = new FormData();
        formData.append('file', blob, 'avatar.png');
        updateAvatar(formData);
    }

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <UserContainer id="user-container">
            <AvatarContainer id="avatar-container">
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-input"
                    type="file"
                    onChange={(e) => {
                        onSelectFile(e);
                        setOpen(true);
                    }}
                />
                {console.log(selectedImage)}
                <label htmlFor="avatar-input">
                    {selectedImage ? (
                        <StyledAvatar
                            key={Date.now()}
                            alt="User Avatar"
                            src={
                                selectedImage.startsWith('blob:')
                                    ? selectedImage
                                    : `${backendUrl}/images/${selectedImage}?t=${Date.now()}`
                            }
                        />
                    ) : (
                        <StyledAvatarPlaceholder>
                            Select an Image
                        </StyledAvatarPlaceholder>
                    )}
                </label>
                <AvatarDialog
                    open={open}
                    handleClose={handleClose}
                    handleSave={handleSave}
                    imgSrc={imgSrc}
                    crop={crop}
                    setCrop={setCrop}
                    setCompletedCrop={setCompletedCrop}
                    imgRef={imgRef}
                    onImageLoad={onImageLoad}
                    aspect={aspect}
                />
                <Box
                    sx={{ display: 'flex', alignItems: 'center' }}
                    onClick={() => setIsEditing(true)}
                >
                    {isEditing ? (
                        <ProfileTextField
                            autoFocus
                            size="small"
                            value={profileData.username}
                            type="text"
                            variant="outlined"
                            onChange={(e) =>
                                setProfileData({
                                    ...profileData,
                                    username: e.target.value,
                                })
                            }
                            onBlur={() => {
                                setIsEditing(false);
                            }}
                        />
                    ) : (
                        <Username variant="body1">
                            {profileData.username}
                        </Username>
                    )}
                </Box>
            </AvatarContainer>
            <TextFieldContainer>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <ProfileTextField
                        size="small"
                        value={profileData.first_name}
                        label={!profileData.first_name ? 'First Name' : null}
                        type="text"
                        variant="outlined"
                        onChange={(e) =>
                            setProfileData({
                                ...profileData,
                                first_name: e.target.value,
                            })
                        }
                    />
                    <ProfileTextField
                        size="small"
                        value={profileData.last_name}
                        label={!profileData.last_name ? 'Last Name' : null}
                        type="text"
                        variant="outlined"
                        onChange={(e) =>
                            setProfileData({
                                ...profileData,
                                last_name: e.target.value,
                            })
                        }
                    />
                </Box>
                <ProfileTextField
                    size="small"
                    label="Update Anthropic Key"
                    type="password"
                    variant="outlined"
                    onChange={(e) =>
                        setProfileData({
                            ...profileData,
                            anthropic_key: e.target.value,
                        })
                    }
                />
                <ProfileTextField
                    size="small"
                    label="Update OpenAI Key"
                    type="password"
                    variant="outlined"
                    onChange={(e) =>
                        setProfileData({
                            ...profileData,
                            open_key: e.target.value,
                        })
                    }
                />
            </TextFieldContainer>
            <StyledButton
                id="update-profile-button"
                onClick={() => updateUserProfile()}
                size="large"
                sx={{ margin: 3 }}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} /> : 'Save'}
            </StyledButton>
        </UserContainer>
    );
};

export default User;
