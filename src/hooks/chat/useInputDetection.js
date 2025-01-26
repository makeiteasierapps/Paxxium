import { useState } from 'react';

export const useInputDetection = ({ kbArray, addContextItem }) => {
    const [input, setInput] = useState('');
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

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

    const validateAndGetKb = (mentionText) => {
        const normalizedMention = mentionText.toLowerCase();
        const kb = kbArray.find(
            (kb) => kb.name.toLowerCase() === normalizedMention
        );

        return kb
            ? {
                  type: 'kb',
                  id: kb.id,
                  name: kb.name,
              }
            : null;
    };

    const validateUrl = (url) => {
        try {
            const urlToTest = url.startsWith('http') ? url : `https://${url}`;
            new URL(urlToTest);
            return true;
        } catch {
            return false;
        }
    };

    const handleMentionSelect = (option) => {
        const mention = detectMentions(input, input.length);
        if (!mention) return;

        const beforeMention = input.slice(0, mention.startPosition);
        const afterMention = input.slice(mention.endPosition);
        const newInput = `${beforeMention}${afterMention}`;

        const kb = validateAndGetKb(option);
        if (kb) {
            addContextItem('kb', kb);
        } else if (validateUrl(option)) {
            const urlToAdd = option.startsWith('http')
                ? option
                : `https://${option}`;
            addContextItem('url', urlToAdd);
        }

        setInput(newInput);
        setMentionAnchorEl(null);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        const cursorPosition = event.target.selectionStart;
        setInput(newValue);

        // Handle mentions
        const mention = detectMentions(newValue, cursorPosition);
        if (!mention) {
            setMentionAnchorEl(null);
            setMentionOptions([]);
            return;
        }

        setMentionAnchorEl(event.currentTarget);

        // First check KB matches
        const kbMatches = kbArray
            .filter((kb) =>
                kb.name.toLowerCase().includes(mention.searchTerm.toLowerCase())
            )
            .map((kb) => kb.name);

        // If we have KB matches, use those
        if (kbMatches.length > 0) {
            const exactMatch = kbMatches.find(
                (option) =>
                    option.toLowerCase() === mention.searchTerm.toLowerCase()
            );

            if (exactMatch) {
                handleMentionSelect(exactMatch);
                return;
            }

            setMentionOptions(kbMatches);
            return;
        }

        // If no KB matches and the input looks like a URL, show it as an option
        if (mention.searchTerm.includes('.')) {
            setMentionOptions([mention.searchTerm]);

            // If it's a valid URL and ends with a space, add it
            if (validateUrl(mention.searchTerm) && newValue.endsWith(' ')) {
                handleMentionSelect(mention.searchTerm);
                return;
            }
        } else {
            setMentionAnchorEl(null);
            setMentionOptions([]);
        }
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
        mentionAnchorEl,
        setMentionAnchorEl,
        mentionOptions,
        highlightedIndex,
        handleInputChange,
        handleMenuKeyDown,
        handleMentionSelect,
        detectMentions,
    };
};
