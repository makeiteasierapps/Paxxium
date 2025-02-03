export const useContextManager = ({
    selectedChat,
    updateSettings,
    updateLocalSettings,
    backendUrl,
}) => {
    const handleDeleteImage = async (imageContextItem) => {
        const params = {
            path: imageContextItem.image_path,
        };
        const response = await fetch(`${backendUrl}/images`, {
            method: 'DELETE',
            body: JSON.stringify(params),
        });
        if (response.ok) {
            console.log('Image deleted successfully');
            return true;
        } else {
            console.error('Failed to delete image');
            return false;
        }
    };

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
            case 'image':
                newContext.push({
                    type: 'image',
                    name: item.name,
                    image: item,
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

    const removeContextItem = async (type, itemToRemove) => {
        if (type === 'image') {
            const deleted = await handleDeleteImage(itemToRemove);
            if (!deleted) return;
        }

        const newContext = (selectedChat.context || []).filter((item) => {
            switch (type) {
                case 'image':
                    return item.name !== itemToRemove.name;
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
