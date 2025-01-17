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
import DetectedItems from './DetectedItems';
import { useDropzone } from 'react-dropzone';
import MentionMenu from './MentionMenu';
import { useImageHandling } from '../../../hooks/chat/useImageHandling';
import EndAdornment from './EndAdornment';

const MessageInput = () => {
    const {
        input,
        setInput,
        selectedMentions,
        mentionAnchorEl,
        setMentionAnchorEl,
        mentionOptions,
        handleInputChange,
        handleMentionSelect,
        sendMessage,
        highlightedIndex,
        setCursorPosition,
        handleMenuKeyDown,
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
            <DetectedItems />
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
                    onBlur={(e) => {
                        // Give menu click events time to fire before closing
                        setTimeout(() => {
                            if (
                                !document.activeElement?.closest(
                                    '.mention-menu'
                                )
                            ) {
                                setIsFocused(false);
                                setMentionAnchorEl(null);
                            }
                        }, 0);
                    }}
                    // Add cursor tracking
                    onSelect={(e) => {
                        setCursorPosition(e.target.selectionStart);
                    }}
                    onKeyDown={(event) => {
                        // Handle mention menu navigation when it's open
                        if (mentionAnchorEl) {
                            switch (event.key) {
                                case 'ArrowDown':
                                case 'ArrowUp':
                                case 'Escape':
                                    handleMenuKeyDown(event);
                                    return; // Prevent further processing
                                case 'Enter':
                                    if (highlightedIndex >= 0) {
                                        event.preventDefault();
                                        handleMentionSelect(
                                            mentionOptions[highlightedIndex]
                                        );
                                        return; // Prevent message from being sent
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }

                        // Only handle message sending if we're not handling a mention
                        if (
                            event.key === 'Enter' &&
                            !event.shiftKey &&
                            input.trim() !== '' &&
                            !mentionAnchorEl // Add this check
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
                    className="mention-menu"
                    highlightedIndex={highlightedIndex}
                    selectedMentions={selectedMentions}
                />
            </StyledBox>
        </InputArea>
    );
};

export default MessageInput;
