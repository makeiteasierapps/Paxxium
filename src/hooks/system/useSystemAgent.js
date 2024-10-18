export const useSystemAgent = ({backendUrl, uid, socket, showSnackbar, addMessage, getMessages, selectedChat, kbArray, detectedUrls}) => {
    const sendMessage = async (input, image = null) => {

        const userMessage = {
            content: input,
            message_from: 'user',
            created_at: new Date().toISOString(),
            type: 'database',
            image_path: imageBlob,
        };
        addMessage(selectedChat.chatId, userMessage, true);
        const chatHistory = await getMessages(selectedChat.chatId);
        try {
            if (socket) {
                socket.emit('chat', {
                    uid,
                    chatId: selectedChat.chatId,
                    dbName: 'paxxium',
                    imageBlob,
                    fileName: imageBlob ? imageBlob.name : null,
                    chatSettings: selectedChat,
                    chatHistory,
                    userMessage,
                });
            }
        } catch (error) {
            console.error(error);
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
        }
    };
}




