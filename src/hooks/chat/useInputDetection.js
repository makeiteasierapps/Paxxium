import { useState, useContext } from 'react';
import { KbContext } from '../../contexts/KbContext';

export const useInputDetection = () => {
    const [input, setInput] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedMentions, setSelectedMentions] = useState(new Set());
    const [detectedUrls, setDetectedUrls] = useState([]);
    const { kbArray } = useContext(KbContext);

    const detectUrls = (text) => {
        // Split text by spaces to check completed words
        const words = text.split(' ');

        // Only process completed words (not the last word unless it ends with space)
        const completedWords = text.endsWith(' ') ? words : words.slice(0, -1);

        const urlRegex = new RegExp(
            '^(' + // Start of string
                '(?:https?://|www\\.)?' + // Protocol or www
                '[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*' + // Domain name
                '\\.' +
                '(?:com|net|org|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|co|' +
                'uk|us|ca|eu|de|jp|fr|au|ru|ch|it|nl|se|no|es|io|dev|ai|app)' +
                '(?::\\d{2,5})?' + // Port number (optional)
                '(?:[/?#][^\\s"]*)?)', // Path (optional)
            'i' // Case insensitive, but not global since we're checking one word at a time
        );

        const validUrls = completedWords
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
            .map((url) => url.trim());

        return [...new Set(validUrls)]; // Remove any duplicates
    };

    const detectMentions = (text, cursorPosition) => {
        // Only look for @ symbols before the cursor position
        const textUpToCursor = text.slice(0, cursorPosition);
        const lastAtIndex = textUpToCursor.lastIndexOf('@');

        if (lastAtIndex === -1) return null;

        // Get the word containing the cursor
        const textAfterAt = text.slice(lastAtIndex + 1);
        const match = textAfterAt.match(/^(\S*)/);
        const currentWord = match ? match[1] : '';

        // Check if we're still within the mention word
        const cursorPositionInWord = cursorPosition - (lastAtIndex + 1);
        if (
            cursorPositionInWord < 0 ||
            cursorPositionInWord > currentWord.length
        ) {
            return null;
        }

        return {
            searchTerm: currentWord,
            position: lastAtIndex,
            startPosition: lastAtIndex,
            endPosition: lastAtIndex + 1 + currentWord.length,
        };
    };

    const handleMentionSelect = (option) => {
        const mention = detectMentions(input, cursorPosition);
        if (!mention) return;

        const formattedOption = option.replace(/\s+/g, '-');

        setSelectedMentions((prev) => new Set(prev).add(formattedOption));
        setMentionAnchorEl(null);
        setHighlightedIndex(-1);

        // Calculate new cursor position after the inserted mention
        const newPosition = mention.startPosition + formattedOption.length + 2; // +2 for @ and space
        setCursorPosition(newPosition);
    };

    // Validate mentions before sending
    const validateMentions = (text) => {
        const mentionRegex = /@([\w-]+)/g;
        const matches = [...text.matchAll(mentionRegex)];

        return matches.map((match) => ({
            mention: match[1],
            isValid:
                selectedMentions.has(match[1]) ||
                kbArray.some((kb) => kb.name.replace(/\s+/g, '-') === match[1]),
        }));
    };

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        const cursorPosition = event.target.selectionStart;
        setInput(newValue);

        // Only detect URLs in completed words
        if (newValue.endsWith(' ')) {
            const urls = detectUrls(newValue);
            setDetectedUrls((prev) => {
                const newUrls = new Set([...prev, ...urls]);
                return Array.from(newUrls);
            });
        }

        // Remove URLs that are no longer in the input
        setDetectedUrls((prev) => prev.filter((url) => newValue.includes(url)));

        // Handle mention detection
        const mention = detectMentions(newValue, cursorPosition);
        if (!mention) {
            setMentionAnchorEl(null);
            setMentionOptions([]);
            return;
        }

        // Update mention suggestions
        setMentionAnchorEl(event.currentTarget);
        const filteredOptions =
            mention.searchTerm === ''
                ? kbArray.map((kb) => kb.name)
                : kbArray
                      .filter((kb) =>
                          kb.name
                              .toLowerCase()
                              .includes(mention.searchTerm.toLowerCase())
                      )
                      .map((kb) => kb.name);

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
        detectedUrls,
        handleInputChange,
        handleMentionSelect,
        handleMenuKeyDown,
        validateMentions,
        selectedMentions,
        setSelectedMentions,
    };
};
