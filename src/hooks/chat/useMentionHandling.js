import { useState, useEffect } from 'react';

export const useMentionHandling = () => {
    const [input, setInput] = useState('');
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [mentionSearch, setMentionSearch] = useState('');

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setInput(newValue);

        // Check for @ symbol
        const lastAtIndex = newValue.lastIndexOf('@');
        if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
            setMentionAnchorEl(event.currentTarget);
            setMentionSearch('');
            // Fetch mention options here
            setMentionOptions(['Option 1', 'Option 2', 'Option 3']);
        } else if (lastAtIndex !== -1) {
            const searchTerm = newValue.slice(lastAtIndex + 1);
            setMentionSearch(searchTerm);
            // Filter mention options based on searchTerm
            setMentionOptions(
                ['Option 1', 'Option 2', 'Option 3'].filter((option) =>
                    option.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setMentionAnchorEl(null);
        }
    };

    const handleMentionSelect = (option) => {
        const lastAtIndex = input.lastIndexOf('@');
        const newInput = input.slice(0, lastAtIndex) + '@' + option + ' ';
        setInput(newInput);
        setMentionAnchorEl(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mentionAnchorEl && !mentionAnchorEl.contains(event.target)) {
                setMentionAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mentionAnchorEl]);

    return {
        input,
        setInput,
        mentionAnchorEl,
        mentionOptions,
        handleInputChange,
        handleMentionSelect
    };
};