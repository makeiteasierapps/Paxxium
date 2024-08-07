import { useState, useContext } from 'react';
import { KbContext } from '../../contexts/KbContext';

export const useInputDetection = () => {
    const [input, setInput] = useState('');
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [isWebsiteDetected, setIsWebsiteDetected] = useState(false);
    const [detectedUrls, setDetectedUrls] = useState([]);

    const { kbArray } = useContext(KbContext);

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setInput(newValue);

        const lastAtIndex = newValue.lastIndexOf('@');
        const words = newValue.split(/\s+/);
        const newDetectedUrls = words.filter(isValidUrl);
        setDetectedUrls(newDetectedUrls);
        setIsWebsiteDetected(newDetectedUrls.length > 0);

        // Handle mention detection
        if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
            setMentionAnchorEl(event.currentTarget);
            setMentionOptions(kbArray.map((kb) => kb.name));
        } else if (lastAtIndex !== -1) {
            const searchTerm = newValue.slice(lastAtIndex + 1);
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

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    return {
        input,
        setInput,
        mentionAnchorEl,
        mentionOptions,
        isWebsiteDetected,
        detectedUrls,
        handleInputChange,
        handleMentionSelect,
    };
};
