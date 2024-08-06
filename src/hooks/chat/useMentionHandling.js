import { useState, useEffect, useContext } from 'react';
import { KbContext } from '../../contexts/KbContext';

export const useMentionHandling = () => {
    const [input, setInput] = useState('');
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [mentionSearch, setMentionSearch] = useState('');
    const { kbArray } = useContext(KbContext);

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setInput(newValue);

        const lastAtIndex = newValue.lastIndexOf('@');
        if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
            setMentionAnchorEl(event.currentTarget);
            setMentionSearch('');
            setMentionOptions(kbArray.map((kb) => kb.name));
        } else if (lastAtIndex !== -1) {
            const searchTerm = newValue.slice(lastAtIndex + 1);
            setMentionSearch(searchTerm);
            setMentionOptions(
                kbArray
                    .filter((kb) =>
                        kb.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((kb) => kb.name)
            );
        } else {
            setMentionAnchorEl(null);
        }
    };

    const handleMentionSelect = (option) => {
        const lastAtIndex = input.lastIndexOf('@');
        const formattedOption = option.replace(/\s+/g, '-');
        const newInput =
            input.slice(0, lastAtIndex) + '@' + formattedOption + ' ';
        setInput(newInput);
        setMentionAnchorEl(null);
    };

    return {
        input,
        setInput,
        mentionAnchorEl,
        mentionOptions,
        handleInputChange,
        handleMentionSelect,
    };
};
