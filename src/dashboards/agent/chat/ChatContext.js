import { useState, createContext } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [agentArray, setAgentArray] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [messages, setMessages] = useState({});
    const [insideCodeBlock, setInsideCodeBlock] = useState(false);


    // Used to add a new user message to the messages state
    const addMessage = (chatId, newMessage) => {
        setMessages((prevMessageParts) => ({
            ...prevMessageParts,
            [chatId]: [...(prevMessageParts[chatId] || []), newMessage],
        }));
    };

    const getMessages = (chatId) => {
        return messages[chatId] || [];
    };

    return (
        <ChatContext.Provider
            value={{
                agentArray,
                setAgentArray,
                selectedAgent,
                setSelectedAgent,
                messages,
                setMessages,
                addMessage,
                getMessages,
                insideCodeBlock,
                setInsideCodeBlock,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
