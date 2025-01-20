import { useState, useContext } from 'react';
import { KbContext } from '../../contexts/KbContext';

export const useInputDetection = ({
    getSelectedChat,
    updateLocalSettings,
    handleUpdateSettings,
}) => {
    const [input, setInput] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedMentions, setSelectedMentions] = useState(new Set());
    const { kbArray } = useContext(KbContext);
    const selectedChat = getSelectedChat();

    const handleRemoveUrl = async (urlItem) => {
        const existingUrls = selectedChat?.context_urls || [];
        const filteredUrls = existingUrls.filter((existingUrl) =>
            typeof existingUrl === 'string'
                ? existingUrl !== urlItem
                : existingUrl.url !== urlItem.url
        );

        // If urlItem is a string, update local state only
        if (typeof urlItem === 'string') {
            updateLocalSettings({
                chatId: selectedChat.chatId,
                uid: selectedChat.uid,
                context_urls: filteredUrls,
            });
        } else {
            // If urlItem is an object, update server state
            await handleUpdateSettings({
                chatId: selectedChat.chatId,
                uid: selectedChat.uid,
                context_urls: filteredUrls,
            });
        }
    };

    const handleRemoveMention = (mentionToRemove) => {
        setSelectedMentions((prev) => {
            const newMentions = new Set(prev);
            newMentions.delete(mentionToRemove);
            return newMentions;
        });
    };

    const detectUrls = (text) => {
        const words = text.split(' ');
        const completedWords = text.endsWith(' ') ? words : words.slice(0, -1);

        const urlRegex = new RegExp(
            '(?:https?://|www\\.)?' + // Protocol or www
                '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+' + // Domain segments
                '[a-zA-Z]{2,}' + // TLD
                '(?::\\d{2,5})?' + // Optional port
                '(?:/[^\\s]*)?', // Path and query params
            'i'
        );

        return new Set(
            completedWords
                .filter((word) => {
                    try {
                        if (!urlRegex.test(word)) return false;
                        const urlToTest = word.startsWith('http')
                            ? word
                            : `https://${word}`;
                        new URL(urlToTest);
                        return true;
                    } catch {
                        return false;
                    }
                })
                .map((url) => url.trim())
        );
    };

    const detectMentions = (text, cursorPosition) => {
        // Only look for @ symbols before the cursor position
        const textUpToCursor = text.slice(0, cursorPosition);
        const lastAtIndex = textUpToCursor.lastIndexOf('@');

        if (lastAtIndex === -1) return null;

        // Get all text after @ up to the next @ or end
        const textAfterAt = text.slice(lastAtIndex + 1);
        const nextAtIndex = textAfterAt.indexOf('@');
        const relevantText =
            nextAtIndex === -1
                ? textAfterAt
                : textAfterAt.slice(0, nextAtIndex);

        // Get the word containing the cursor, allowing spaces
        const match = relevantText.match(/^([^@]*)/);
        const currentWord = match ? match[1] : '';

        // Check if we're still within the mention text
        const cursorPositionInWord = cursorPosition - (lastAtIndex + 1);
        if (cursorPositionInWord < 0) {
            return null;
        }

        return {
            searchTerm: currentWord.trim(),
            position: lastAtIndex,
            startPosition: lastAtIndex,
            endPosition: lastAtIndex + 1 + currentWord.length,
        };
    };

    const handleMentionSelect = (option) => {
        const mention = detectMentions(input, cursorPosition);
        if (!mention) return;

        const beforeMention = input.slice(0, mention.startPosition);
        const afterMention = input.slice(mention.endPosition);

        // Remove the mention text completely
        const newInput = `${beforeMention}${afterMention}`;

        setSelectedMentions((prev) => new Set(prev).add(option));
        setInput(newInput);
        setMentionAnchorEl(null);
        setHighlightedIndex(-1);
    };

    const validateMentions = (text) => {
        // Updated regex to capture everything between @ and space/end
        const mentionRegex = /@([^@]+?)(?=\s|$)/g;
        const matches = [...text.matchAll(mentionRegex)];

        return matches.map((match) => ({
            mention: match[1].trim(),
            isValid:
                selectedMentions.has(match[1].replace(/\s+/g, '-')) ||
                kbArray.some(
                    (kb) => kb.name.toLowerCase() === match[1].toLowerCase()
                ),
        }));
    };

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        const cursorPosition = event.target.selectionStart;
        setInput(newValue);

        // Handle URLs - only process completed words (when space is typed)
        if (newValue.endsWith(' ')) {
            const newUrls = detectUrls(newValue);
            if (newUrls.size > 0) {
                const existingUrls = new Set(selectedChat?.context_urls || []);
                const updatedUrls = Array.from(
                    new Set([...existingUrls, ...newUrls])
                );

                // Only update local state
                updateLocalSettings({
                    chatId: selectedChat.chatId,
                    uid: selectedChat.uid,
                    context_urls: updatedUrls,
                });
            }
        }

        // Handle mention detection - continuous process
        const mention = detectMentions(newValue, cursorPosition);
        if (!mention) {
            setMentionAnchorEl(null);
            setMentionOptions([]);
            return;
        }

        // Update mention suggestions
        setMentionAnchorEl(event.currentTarget);
        const filteredOptions = kbArray
            .filter((kb) =>
                kb.name.toLowerCase().includes(mention.searchTerm.toLowerCase())
            )
            .map((kb) => kb.name);

        // Check for exact match (case-insensitive)
        const exactMatch = filteredOptions.find(
            (option) =>
                option.toLowerCase() === mention.searchTerm.toLowerCase()
        );

        if (exactMatch) {
            // Auto-select the exact match
            handleMentionSelect(exactMatch);
            return;
        }

        // Close menu if no matches found
        if (filteredOptions.length === 0) {
            setMentionAnchorEl(null);
        }
        setMentionOptions(filteredOptions);
    };

    const handleMenuKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < mentionOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : mentionOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleMentionSelect(mentionOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setMentionAnchorEl(null);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    return {
        input,
        setInput,
        cursorPosition,
        setCursorPosition,
        mentionAnchorEl,
        setMentionAnchorEl,
        mentionOptions,
        highlightedIndex,
        handleInputChange,
        handleMentionSelect,
        handleMenuKeyDown,
        validateMentions,
        selectedMentions,
        handleRemoveUrl,
        handleRemoveMention,
    };
};
