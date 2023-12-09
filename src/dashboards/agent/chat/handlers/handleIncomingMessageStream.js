import { formatStreamMessage } from '../../utils/messageFormatter';
export const handleIncomingMessageStream = (
    prevMessage,
    id,
    tokenObj,
    insideCodeBlock
) => {
    let language = '';
    // Ignore empty message_content
    if (tokenObj.content === '') {
        return prevMessage;
    }

    if (tokenObj.language) {
        language = tokenObj.language;
    }

    const messagePartsArray = formatStreamMessage(
        tokenObj,
        insideCodeBlock,
        language
    );

    // Start of a debate Stream
    if (!prevMessage[id] || prevMessage[id].length === 0) {
        return {
            ...prevMessage,
            [id]: [messagePartsArray],
        };
    }

    const lastMessageFrom =
        prevMessage[id][prevMessage[id].length - 1].message_from;
    // If this is truthy that means the last message is an object and this is a start of a new stream
    if (lastMessageFrom) {
        return {
            ...prevMessage,
            [id]: [...prevMessage[id], messagePartsArray],
        };
    } else {
        const newPrevMessage = { ...prevMessage };

        const lastMessageIndex = newPrevMessage[id].length - 1;
        let lastMessage = newPrevMessage[id][lastMessageIndex];

        // If lastMessage is not an array, convert it into an array
        if (!Array.isArray(lastMessage)) {
            lastMessage = [lastMessage];
        }

        // Check if the last message is of type 'text' and append the new content to it
        // Get the last object in the lastMessage array
        const lastMessageObject = lastMessage[lastMessage.length - 1];
        if (lastMessageObject.type === messagePartsArray[0].type) {
            // If the types match, append the new content to the last object's content
            lastMessageObject.content += messagePartsArray[0].content;
        } else {
            // If the types do not match, add the new result as a new object in the lastMessage array
            lastMessage.push(messagePartsArray[0]);
        }

        // Update the last message in newPrevMessage
        newPrevMessage[id][lastMessageIndex] = lastMessage;

        // Return the updated messages array without spreading it into a new array
        return newPrevMessage;
    }
};