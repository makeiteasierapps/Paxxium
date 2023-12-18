import { Box } from '@mui/material';
import { useContext, useState } from 'react';
import { ProfileContext } from '../ProfileContext';

import {
    UserContainer,
    AvatarContainer,
    StyledAvatar,
    ProfileTextField,
    Username,
    TextFieldContainer,
} from '../styledProfileComponents';

const User = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { profileData, setProfileData, handleAvatarChange, avatar } =
        useContext(ProfileContext);

    return (
        <UserContainer id="user-container" elevation={9}>
            <AvatarContainer id="avatar-container">
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-input"
                    type="file"
                    onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-input">
                    <StyledAvatar alt="User Avatar" src={avatar} />
                </label>
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
