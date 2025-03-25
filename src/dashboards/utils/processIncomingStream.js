export const processIncomingStream = (chatThread = [], tokenObj) => {
    // Skip empty content
    if (!tokenObj || tokenObj.content === '') {
        return chatThread;
    }

    try {
        // Create a deep copy to avoid mutation issues
        // Using a try-catch because very large messages might cause JSON problems
        const updatedThread = JSON.parse(JSON.stringify(chatThread));

        // If the chat thread is empty or the last message is from the user, add a new agent message
        if (
            updatedThread.length === 0 ||
            updatedThread[updatedThread.length - 1].message_from === 'user'
        ) {
            console.log('%cCreating new message', 'color: purple');
            return [
                ...updatedThread,
                {
                    message_from: 'agent',
                    content: [{ ...tokenObj }], // Clone the token
                    created_at: new Date().toISOString(),
                },
            ];
        }

        // Get the last message (which must be from the agent)
        const lastMessageIndex = updatedThread.length - 1;
        const lastMessage = updatedThread[lastMessageIndex];

        // Convert string content to array if needed (for db-loaded messages)
        if (!Array.isArray(lastMessage.content)) {
            lastMessage.content = [
                { type: 'text', content: String(lastMessage.content || '') },
            ];
        }

        // Simplest approach: Just check the last content item
        const lastContentIndex = lastMessage.content.length - 1;
        const lastContent = lastMessage.content[lastContentIndex];

        // If the last content type matches this token, append to it
        if (lastContent.type === tokenObj.type) {
            // Create a new content object (don't mutate the old one)
            const updatedContent = {
                ...lastContent,
                content: lastContent.content + tokenObj.content,
            };

            // Replace the old content with the updated one
            lastMessage.content[lastContentIndex] = updatedContent;

            console.log(
                '%cAppending to existing content',
                'color: purple',
                lastMessage.content[lastContentIndex].content.length
            );
        } else {
            // Add as a new content item
            lastMessage.content.push({ ...tokenObj });
            console.log(
                '%cAdding new content type',
                'color: purple',
                tokenObj.type
            );
        }

        return updatedThread;
    } catch (error) {
        console.error('Error in processIncomingStream:', error);
        // Fallback: try a simpler approach if JSON parsing fails
        const lastMessage = chatThread[chatThread.length - 1];

        // If last message is from user or thread is empty, create a new message
        if (!lastMessage || lastMessage.message_from === 'user') {
            return [
                ...chatThread,
                {
                    message_from: 'agent',
                    content: [{ ...tokenObj }],
                    created_at: new Date().toISOString(),
                },
            ];
        }

        // Add to existing message
        const updatedMessage = { ...lastMessage };

        if (!Array.isArray(updatedMessage.content)) {
            updatedMessage.content = [
                { type: 'text', content: String(updatedMessage.content || '') },
            ];
        }

        // Always add as a new item in fallback mode
        updatedMessage.content.push({ ...tokenObj });

        // Replace the last message
        const result = [...chatThread];
        result[result.length - 1] = updatedMessage;
        return result;
    }
};
