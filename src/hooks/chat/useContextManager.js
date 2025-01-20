import { useState } from 'react';
import { useImageHandling } from './useImageHandling';

export const useContextManager = ({ selectedChat }) => {
    const { handleFileInput, onDrop } = useImageHandling();

    const addContextItem = (type, item) => {
        const newContext = [...(selectedChat.context || [])];

        switch (type) {
            case 'url':
                newContext.push({
                    type: 'url',
                    content: item,
                    id: Date.now(),
                });
                break;
            case 'kb':
                if (
                    !newContext.some(
                        (contextItem) => contextItem.id === item.id
                    )
                ) {
                    newContext.push({
                        type: 'kb',
                        name: item.name,
                        id: item.id,
                    });
                }
                break;
            case 'file':
                newContext.push({
                    type: 'file',
                    content: item,
                    name: item.name,
                    id: Date.now(),
                });
                break;
            default:
                return true;
        }

        selectedChat.context = newContext;
    };

    const removeContextItem = (type, itemToRemove) => {
        const newContext = (selectedChat.context || []).filter((item) => {
            switch (type) {
                case 'url':
                    return item.source !== itemToRemove;
                case 'kb':
                    return item.id !== itemToRemove.id;
                case 'file':
                    return item.id !== itemToRemove.id;
                default:
                    return true;
            }
        });

        selectedChat.context = newContext;
    };

    const handleFileDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            onDrop(acceptedFiles);
            addContextItem('file', file);
        }
    };

    return {
        addContextItem,
        removeContextItem,
        handleFileDrop,
        onDrop,
    };
};
