export const processIncomingStream = (chatThread = [], tokenObj) => {
    if (tokenObj.content === '') {
        return chatThread;
    }

    // If the chat thread is empty or the last message is from the user, add the tokenObj
    if (
        chatThread.length === 0 ||
        chatThread[chatThread.length - 1].message_from === 'user'
    ) {
        return [
            ...chatThread,
            {
                message_from: 'agent',
                content: [tokenObj],
            },
        ];
    } else {
        const updatedThread = [...chatThread];
        const lastMessageIndex = updatedThread.length - 1;
        let lastMessageObject = updatedThread[lastMessageIndex];

        // Check if the last message object has the same type as the incoming token
        if (
            lastMessageObject.content[lastMessageObject.content.length - 1]
                .type === tokenObj.type
        ) {
            lastMessageObject.content[
                lastMessageObject.content.length - 1
            ].content += tokenObj.content;
        } else {
            lastMessageObject.content.push(tokenObj);
        }

        return updatedThread;
    }
};
