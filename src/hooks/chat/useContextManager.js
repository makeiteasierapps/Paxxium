import { useFileUpload } from './useFileUpload';

export const useContextManager = ({ selectedChat, handleUpdateSettings }) => {
    const { uploadFile } = useFileUpload();
    const addContextItem = async (type, item) => {
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
                // First add the file to context with a pending status
                const fileContextItem = {
                    type: 'file',
                    name: item.name,
                    id: Date.now(),
                    status: 'pending',
                    file: item, // Temporarily store the file
                };
                try {
                    newContext.push(fileContextItem);

                    // Update state immediately to show pending status
                    await handleUpdateSettings({
                        chatId: selectedChat.chatId,
                        uid: selectedChat.uid,
                        context: newContext,
                    });

                    // Upload the file
                    const url = await uploadFile(item);

                    // Update the context item with the URL and remove the file
                    const updatedContext = newContext.map((contextItem) =>
                        contextItem.id === fileContextItem.id
                            ? {
                                  type: 'file',
                                  name: item.name,
                                  id: contextItem.id,
                                  url,
                                  status: 'completed',
                                  file: undefined,
                              }
                            : contextItem
                    );

                    // Update state with the URL
                    await handleUpdateSettings({
                        chatId: selectedChat.chatId,
                        uid: selectedChat.uid,
                        context: updatedContext,
                    });
                } catch (error) {
                    const updatedContext = newContext.map((contextItem) =>
                        contextItem.id === fileContextItem.id
                            ? {
                                  type: 'file',
                                  name: item.name,
                                  id: contextItem.id,
                                  status: 'error',
                                  file: undefined, // Explicitly remove file property
                              }
                            : contextItem
                    );

                    await handleUpdateSettings({
                        chatId: selectedChat.chatId,
                        uid: selectedChat.uid,
                        context: updatedContext,
                    });

                    throw error;
                }
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

    return {
        addContextItem,
        removeContextItem,
    };
};
