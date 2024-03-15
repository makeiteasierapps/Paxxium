import { useState, createContext, useContext, useRef } from "react";
import { AuthContext } from "../../../auth/AuthContext";
import { processToken } from "../utils/processToken";
import { resizeImage } from "../utils/resizeImage";

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const { idToken, uid } = useContext(AuthContext);
  const [agentArray, setAgentArray] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState({});
  const [insideCodeBlock, setInsideCodeBlock] = useState(false);
  const ignoreNextTokenRef = useRef(false);
  const languageRef = useRef(null);

  const messagesUrl =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_MESSAGES_URL
      : process.env.REACT_APP_BACKEND_URL_PROD;

  const chatUrl =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_CHAT_URL
      : process.env.REACT_APP_BACKEND_URL_PROD;

  // Used to add a new user message to the messages state
  const addMessage = (chatId, newMessage) => {
    setMessages((prevMessageParts) => ({
      ...prevMessageParts,
      [chatId]: [...(prevMessageParts[chatId] || []), newMessage],
    }));
  };

  // Used to get the messages for a specific chat
  const getMessages = (chatId) => {
    return messages[chatId] || [];
  };

  const getChatData = async () => {
    try {
      const response = await fetch(`${chatUrl}/chat`, {
        method: "GET",
        headers: {
          Authorization: idToken,
        },
      });

      if (!response.ok) throw new Error("Failed to load user conversations");

      const data = await response.json();
      setAgentArray(data);
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const loadChat = async (selectedId) => {
    // This is done so that the chat visibility persists even after the page is refreshed
    try {
      const response = await fetch(`${chatUrl}/chat/update_visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ id: selectedId, is_open: true }),
      });

      if (!response.ok) throw new Error("Failed to update chat");

      // Update the local state only after the database has been updated successfully
      setAgentArray((prevAgents) => {
        // Find the agent and update it
        const updatedAgent = prevAgents.find(
          (agent) => agent.id === selectedId
        );
        if (updatedAgent) {
          updatedAgent.is_open = true;
        }

        // Filter out the updated agent from the original array
        const filteredAgents = prevAgents.filter(
          (agent) => agent.id !== selectedId
        );

        // Add the updated agent to the beginning of the array
        return updatedAgent
          ? [updatedAgent, ...filteredAgents]
          : filteredAgents;
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch messages from the database
  const loadMessages = async (chatId) => {
    try {
      const messageResponse = await fetch(`${messagesUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ chatId }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to load messages");
      }

      const messageData = await messageResponse.json();
      if (messageData && messageData.messages.length > 0) {
        setMessages((prevMessageParts) => ({
          ...prevMessageParts,
          [chatId]: messageData.messages,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (input, chatId, chatSettings, image = null) => {
    let imageUrl = null;
    if (image) {
      imageUrl = await new Promise((resolve) => {
        resizeImage(image, 400, 400, async function (resizedImageBlob) {
          const formData = new FormData();

          formData.append("image", resizedImageBlob, "image.png");
          const response = await fetch(`${messagesUrl}/messages/utils`, {
            method: "POST",
            headers: {
              Authorization: idToken,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            resolve(data.fileUrl); // Resolve the Promise with the imageUrl
          } else {
            resolve(null); // Resolve the Promise with null if the response is not ok
          }
        });
      });
    }

    // Optimistic update
    const userMessage = {
      content: input,
      message_from: "user",
      user_id: uid,
      time_stamp: new Date().toISOString(),
      type: "database",
      image_url: imageUrl,
    };
    addMessage(chatId, userMessage);

    const chatHistory = await getMessages(chatId);

    const dataPacket = {
      chatSettings,
      userMessage,
      chatHistory,
      image_url: imageUrl,
    };

    const response = await fetch(`${messagesUrl}/messages/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: idToken,
      },
      body: JSON.stringify(dataPacket),
    });

    if (response.body) {
      const reader = response.body.getReader();
      let completeMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const decodedValue = new TextDecoder("utf-8").decode(value);
        // Split the decoded value by newline and filter out any empty lines
        const jsonChunks = decodedValue
          .split("\n")
          .filter((line) => line.trim() !== "");

        try {
          const messages = jsonChunks.map((chunk) => {
            const messageObj = JSON.parse(chunk);
            processToken(
              messageObj,
              setInsideCodeBlock,
              insideCodeBlock,
              setMessages,
              chatId,
              ignoreNextTokenRef,
              languageRef
            );
            return messageObj.content;
          });
          completeMessage += messages.join("");
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages[chatId].slice(0, -1);
        updatedMessages.push({
          content: completeMessage,
          message_from: "agent",
          type: "database",
        });

        return {
          ...prevMessages,
          [chatId]: updatedMessages,
        };
      });
    } else {
      console.log("No response body");
    }
  };

  const closeChat = async (id) => {
    try {
      const response = await fetch(`${chatUrl}/chat/update_visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ id: id, is_open: false }),
      });
      if (!response.ok) throw new Error("Failed to update chat");
      // Update the local state only after the database has been updated successfully
      setAgentArray((prevChatArray) =>
        prevChatArray.map((chatObj) =>
          chatObj.id === id ? { ...chatObj, is_open: false } : chatObj
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const clearChat = async (id) => {
    try {
      const response = await fetch(`${messagesUrl}/messages/clear`, {
        method: "DELETE",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      if (!response.ok) throw new Error("Failed to clear messages");
      setMessages((prevMessageParts) => ({
        ...prevMessageParts,
        [id]: [],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteChat = async (id) => {
    try {
      const response = await fetch(`${chatUrl}/chat/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ id: id }),
      });
      if (!response.ok) throw new Error("Failed to delete conversation");
      setAgentArray((prevChatArray) =>
        prevChatArray.filter((chatObj) => chatObj.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const createChat = async (
    agentModel,
    systemPrompt,
    chatConstants,
    useProfileData,
    chatName
  ) => {
    try {
      const response = await fetch(`${chatUrl}/chat/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({
          agentModel,
          systemPrompt,
          chatConstants,
          useProfileData,
          chatName,
        }),
      });
      const data = await response.json();
      // Update the agentArray directly here
      setAgentArray((prevAgents) => [data, ...prevAgents]);

      // Set the new agent as the selectedAgent
      setSelectedAgent(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateSettings = async (newAgentSettings) => {
    // Update the settings in the database
    try {
      await fetch(`${chatUrl}/chat/update_settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify(newAgentSettings),
      });
    } catch (error) {
      console.error(error);
    }

    // Update the local settings state
    setAgentArray((prevAgentArray) =>
      prevAgentArray.map((agent) =>
        agent.id === newAgentSettings.id
          ? { ...agent, ...newAgentSettings }
          : agent
      )
    );
    // Update the selected agent in the ChatContext
    setSelectedAgent(newAgentSettings);
  };

  return (
    <ChatContext.Provider
      value={{
        agentArray,
        setAgentArray,
        selectedAgent,
        setSelectedAgent,
        messages,
        loadMessages,
        sendMessage,
        closeChat,
        clearChat,
        deleteChat,
        createChat,
        updateSettings,
        getChatData,
        loadChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
