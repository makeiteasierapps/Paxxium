import { Box } from '@mui/material';
import { useContext, useState, useRef } from 'react';
import { ProfileContext } from '../ProfileContext';
import { AuthContext, backendUrl } from '../../../auth/AuthContext';
import { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
    UserContainer,
    AvatarContainer,
    StyledAvatar,
    ProfileTextField,
    Username,
    TextFieldContainer,
    StyledAvatarPlaceholder
} from '../styledProfileComponents';

import AvatarDialog from './avatarDialog';

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
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);

    const { idToken } = useContext(AuthContext);

    const { profileData, setProfileData, avatar, setAvatar } =
        useContext(ProfileContext);

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

        const aspectRatio = image.naturalWidth / image.naturalHeight;

        // Define your desired width
        const desiredWidth = 400; // replace with your desired width

        // Calculate the height to maintain aspect ratio
        const desiredHeight = desiredWidth / aspectRatio;

        const offscreen = new OffscreenCanvas(desiredWidth, desiredHeight);

        const ctx = offscreen.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            desiredWidth,
            desiredHeight
        );
        // You might want { type: "image/jpeg", quality: <0 to 1> } to
        // reduce image size
        const blob = await offscreen.convertToBlob({
            type: 'image/png',
        });

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = URL.createObjectURL(blob);
        if (hiddenAnchorRef.current) {
            hiddenAnchorRef.current.href = blobUrlRef.current;
            hiddenAnchorRef.current.click();
        }

        // create a FormData object
        const formData = new FormData();
        // append the cropped image blob to the FormData object
        formData.append('avatar', blob);

        // send the FormData object to the server
        try {
            const response = await fetch(
                `${backendUrl}/profile/update_avatar`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: idToken,
                    },
                    body: formData,
                }
            );
            const data = await response.json();
            setAvatar(data.avatarUrl);
        } catch (error) {
            console.error(error);
        }
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
        <UserContainer id="user-container" elevation={9}>
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
                <label htmlFor="avatar-input">
                    {avatar ? (
                        <StyledAvatar alt="User Avatar" src={avatar} />
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
                    label="Serpapi Key"
                    type="password"
                    variant="outlined"
                    onChange={(e) =>
                        setProfileData({
                            ...profileData,
                            serp_key: e.target.value,
                        })
                    }
                />
                <ProfileTextField
                    size="small"
                    label="OpenAI Key"
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
        </UserContainer>
    );
};

export default User;
