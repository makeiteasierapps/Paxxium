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
            <StyledInputTextField
                fullWidth
                multiline
                value={input}
                placeholder="Let's gooooo!"
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    // Give menu click events time to fire before closing
                    setTimeout(() => {
                        if (!document.activeElement?.closest('.mention-menu')) {
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
                        !mentionAnchorEl
                    ) {
                        event.preventDefault();
                        sendMessage(input);
                        setInput('');
                    }
                }}
                InputProps={{
                    endAdornment: (
                        <EndAdornment
                            onSendMessage={sendMessage}
                            input={input}
                            setInput={setInput}
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
        </InputArea>
    );
};

export default MessageInput;
