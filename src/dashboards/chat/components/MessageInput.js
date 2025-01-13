import { useContext, useState } from 'react';
import { Box } from '@mui/material';

import ClearIcon from '@mui/icons-material/Clear';
import { ChatContext } from '../../../contexts/ChatContext';
import {
    InputArea,
    ImageOverlay,
    StyledBox,
    StyledInputTextField,
    StyledInputLabel,
} from '../chatStyledComponents';

import { useDropzone } from 'react-dropzone';
import MentionMenu from './MentionMenu';
import { useImageHandling } from '../../../hooks/chat/useImageHandling';
import EndAdornment from './EndAdornment';

const MessageInput = () => {
    const {
        input,
        setInput,
        mentionAnchorEl,
        mentionOptions,
        handleInputChange,
        handleMentionSelect,
        sendMessage,
    } = useContext(ChatContext);

    const {
        image,
        imagePreviewUrl,
        showOverlay,
        handleFileInput,
        onDrop,
        removeImage,
        setShowOverlay,
    } = useImageHandling();

    const [isFocused, setIsFocused] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
        },
    });

    return (
        <InputArea>
            <StyledBox {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                {image && (
                    <Box
                        onMouseEnter={() => setShowOverlay(true)}
                        onMouseLeave={() => setShowOverlay(false)}
                    >
                        <img
                            width={100}
                            height="auto"
                            src={imagePreviewUrl}
                            alt="preview"
                            style={{
                                display: 'flex',
                            }}
                        />
                        <ImageOverlay
                            style={{
                                visibility: showOverlay ? 'visible' : 'hidden',
                            }}
                            onClick={removeImage}
                        >
                            <ClearIcon />
                        </ImageOverlay>
                    </Box>
                )}
                <StyledInputLabel
                    hasImage={!!image}
                    isFocused={isFocused}
                    userMessage={input}
                >
                    Type Something
                </StyledInputLabel>
                <StyledInputTextField
                    fullWidth
                    multiline
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(event) => {
                        if (
                            event.key === 'Enter' &&
                            !event.shiftKey &&
                            input.trim() !== ''
                        ) {
                            event.preventDefault();
                            sendMessage(input, image);
                            setInput('');
                            removeImage();
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <EndAdornment
                                onSendMessage={sendMessage}
                                input={input}
                                setInput={setInput}
                                image={image}
                                removeImage={removeImage}
                                handleFileInput={handleFileInput}
                            />
                        ),
                    }}
                />
                <MentionMenu
                    anchorEl={mentionAnchorEl}
                    options={mentionOptions}
                    onSelect={handleMentionSelect}
                />
            </StyledBox>
        </InputArea>
    );
};

export default MessageInput;
