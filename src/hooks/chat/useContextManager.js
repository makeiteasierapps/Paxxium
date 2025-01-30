export const useContextManager = ({
    selectedChat,
    updateSettings,
    updateLocalSettings,
}) => {
    const addContextItem = (type, item) => {
        const newContext = [...(selectedChat.context || [])];

        switch (type) {
            case 'url':
                newContext.push({
                    type: 'url',
                    source: item,
                    content: '',
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
                        kb_id: item.id,
                    });
                }
                break;
            case 'file':
                newContext.push({
                    type: 'file',
                    name: item.name,
                    file: item,
                });
                break;
            default:
                return true;
        }

        // Only update local state
        updateLocalSettings({
            chatId: selectedChat.chatId,
            uid: selectedChat.uid,
            context: newContext,
        });
    };

    const removeContextItem = (type, itemToRemove) => {

        const newContext = (selectedChat.context || []).filter((item) => {
            console.log(item);
            switch (type) {
                case 'url':
                    return item.source !== itemToRemove.source;
                case 'kb':
                    return item.kb_id !== itemToRemove.kb_id;
                case 'file':
                    return item.name !== itemToRemove.name;
                default:
                    return true;
            }
        });

        updateSettings({
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
