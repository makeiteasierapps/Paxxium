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
        const beforeMention = input.slice(0, mention.startPosition);
        const afterMention = input.slice(mention.endPosition);

        // Add a space after the mention if there isn't one already
        const newInput = `${beforeMention}@${option}${
            afterMention.startsWith(' ') ? '' : ' '
        }${afterMention}`;

        setSelectedMentions((prev) => new Set(prev).add(formattedOption));
        setInput(newInput);
        setMentionAnchorEl(null);
        setHighlightedIndex(-1);

        // Calculate new cursor position after the inserted mention
        const newPosition = mention.startPosition + option.length + 2; // +2 for @ and space
        setCursorPosition(newPosition);
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

        // Check for completed mentions when space is typed
        if (newValue.endsWith(' ')) {
            const words = newValue.trim().split(' ');
            const lastAtIndex = words.findLastIndex((word) =>
                word.startsWith('@')
            );

            if (lastAtIndex !== -1) {
                // Collect all words from @ until the end to handle multi-word mentions
                const mentionText = words.slice(lastAtIndex).join(' ').slice(1); // Remove @ symbol

                const matchingKb = kbArray.find(
                    (kb) => kb.name.toLowerCase() === mentionText.toLowerCase()
                );

                if (matchingKb) {
                    const formattedMention = matchingKb.name.replace(
                        /\s+/g,
                        '-'
                    );
                    setSelectedMentions((prev) =>
                        new Set(prev).add(formattedMention)
                    );
                }

                const urls = detectUrls(newValue);
                setDetectedUrls((prev) => {
                    const newUrls = new Set([...prev, ...urls]);
                    return Array.from(newUrls);
                });
            }
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
        const filteredOptions = kbArray
            .filter((kb) =>
                kb.name.toLowerCase().includes(mention.searchTerm.toLowerCase())
            )
            .map((kb) => kb.name);

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
        detectedUrls,
        setDetectedUrls,
        handleInputChange,
        handleMentionSelect,
        handleMenuKeyDown,
        validateMentions,
        selectedMentions,
        setSelectedMentions,
    };
};
