import { useState, createContext } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [agentArray, setAgentArray] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [messages, setMessages] = useState({});
    const [insideCodeBlock, setInsideCodeBlock] = useState(false);


    // Used to add a new user message to the messages state
    const addMessage = (agentId, newMessage) => {
        setMessages((prevMessageParts) => ({
            ...prevMessageParts,
            [agentId]: [...(prevMessageParts[agentId] || []), newMessage],
        }));
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
                insideCodeBlock,
                setInsideCodeBlock,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
