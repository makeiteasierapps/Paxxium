import { useContext } from 'react';
import { ChatContext } from '../../../contexts/ChatContext';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';
import { InputArea, StyledInputTextField } from '../chatStyledComponents';
import DetectedItems from './DetectedItems';
import MentionMenu from './MentionMenu';
import EndAdornment from './EndAdornment';

const MessageInput = () => {
    const { sendMessage, selectedChat } = useContext(ChatContext);

    const {
        input,
        setInput,
        mentionAnchorEl,
        setMentionAnchorEl,
        mentionOptions,
        highlightedIndex,
        handleMenuKeyDown,
        handleInputChange,
        handleMentionSelect,
    } = useContext(ContextManagerContext);

    return (
        <InputArea>
            <DetectedItems />
            <StyledInputTextField
                fullWidth
                multiline
                value={input}
                placeholder="Let's gooooo!"
                onChange={handleInputChange}
                onBlur={(e) => {
                    // Give menu click events time to fire before closing
                    setTimeout(() => {
                        if (!document.activeElement?.closest('.mention-menu')) {
                            setMentionAnchorEl(null);
                        }
                    }, 0);
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
                        sendMessage(input, selectedChat);
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
            />
        </InputArea>
    );
};

export default MessageInput;
