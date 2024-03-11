import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../auth/AuthContext";
import { ChatContext } from "../../../dashboards/agent/chat/ChatContext";
import ChatBar from "../chat/components/ChatBar";
import { formatBlockMessage } from "../utils/messageFormatter";
import { processToken } from "../utils/processToken";
import DebateMessage from "./DebateMessage";
import { MessageArea, MessagesContainer, ChatContainerStyled } from "../agentStyledComponents";


const Debate = ({ id, chatName, topic }) => {
    const nodeRef = useRef(null);
    const [queue, setQueue] = useState([]);
    const ignoreNextTokenRef = useRef(false);
    const languageRef = useRef("markdown");
    const [debateMessages, setDebateMessages] = useState({});

    const { insideCodeBlock, setInsideCodeBlock } = useContext(ChatContext);
    const { uid, idToken } = useContext(AuthContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_DEBATE_URL
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const fetchMessages = useCallback(async () => {
        try {
            const requestData = {
                agentModel: "AgentDebate",
            };
            const response = await fetch(`${backendUrl}/${id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: idToken,
                },
                credentials: "include",
                body: JSON.stringify(requestData),
            });
            if (!response.ok) throw new Error("Failed to fetch messages");
            const data = await response.json();
            const newMessages = { [id]: data.messages };
            return newMessages;
        } catch (error) {
            console.error(error);
            return [];
        }
    }, [id, idToken]);


    // Runs when component mounts to either fetch messages or start the debate
    useEffect(() => {
        // Start the debate when the component mounts
        const startDebate = async (turn = 0) => {
            
        };
        startDebate();
    }, [fetchMessages, id, setDebateMessages, topic, uid]);




    useEffect(() => {
        const handleToken = (token) => {
            setQueue((prevQueue) => [...prevQueue, token]);
        };

    }, [id]);

    useEffect(() => {
        if (queue.length > 0) {
            processToken(
                queue[0],
                setInsideCodeBlock,
                insideCodeBlock,
                setDebateMessages,
                id,
                ignoreNextTokenRef,
                languageRef
            );
            setQueue((prevQueue) => prevQueue.slice(1));
        }
    }, [queue, setInsideCodeBlock, insideCodeBlock, id, setDebateMessages]);

    // scrolls chat window to the bottom
    useEffect(() => {
        const node = nodeRef.current;
        node.scroll(0, node.scrollHeight);
    }, [debateMessages]);

    return (
        <ChatContainerStyled>
            <ChatBar chatName={chatName} id={id} />
            <MessagesContainer item xs={9}>
                <MessageArea ref={nodeRef}>
                    {debateMessages[id]?.map((messageObj, index) => {
                        // Check if messageObj is an array, if not convert it into an array
                        const messages = Array.isArray(messageObj)
                            ? messageObj
                            : [messageObj];
                        return messages.map((message, subIndex) => {
                            let formattedMessage = message;
                            if (message) {
                                formattedMessage = formatBlockMessage(message);
                                if (message.message_from === "agent1") {
                                    return (
                                        <DebateMessage
                                            key={`${index}-${subIndex}`}
                                            message={formattedMessage}
                                            agent="agent1"
                                        />
                                    );
                                } else if (message.message_from === "agent2") {
                                    return (
                                        <DebateMessage
                                            key={`${index}-${subIndex}`}
                                            message={formattedMessage}
                                            agent="agent2"
                                        />
                                    );
                                }
                            }
                            return null; // return null when the message doesn't exist
                        });
                    })}
                </MessageArea>
            </MessagesContainer>
        </ChatContainerStyled>
    );
};

export default Debate;
