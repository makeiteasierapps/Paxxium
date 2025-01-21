import { useState } from 'react';
import { useImageHandling } from './useImageHandling';

export const useContextManager = ({ selectedChat, handleUpdateSettings }) => {
    const { handleFileInput, onDrop } = useImageHandling();

    const addContextItem = (type, item) => {
        const newContext = [...(selectedChat.context || [])];

        switch (type) {
            case 'url':
                newContext.push({
                    type: 'url',
                    source: item,
                    content: '',
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

        handleUpdateSettings({
            chatId: selectedChat.chatId,
            uid: selectedChat.uid,
            context: newContext,
        });
    };

    const removeContextItem = (type, itemToRemove) => {
        console.log('itemToRemove', itemToRemove);
        const newContext = (selectedChat.context || []).filter((item) => {
            switch (type) {
                case 'url':
                    return item.source !== itemToRemove.source;
                case 'kb':
                    return item.id !== itemToRemove.id;
                case 'file':
                    return item.id !== itemToRemove.id;
                default:
                    return true;
            }
        });

        handleUpdateSettings({
            chatId: selectedChat.chatId,
            uid: selectedChat.uid,
            context: newContext,
        });
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
