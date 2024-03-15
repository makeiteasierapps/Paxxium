import { memo, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../auth/AuthContext";
import AgentMenu from "./AgentMenu";
import Chat from "./chat/Chat";
import { ChatContext } from "./chat/ChatContext";
import Debate from "./debate/Debate";
import { Box } from "@mui/material";

import {
  Settings,
  SettingsMenuButton,
  SettingsMenuContainer,
} from "./agentStyledComponents";

import { CustomGridLoader } from "../main/customLoaders";

const AgentDash = () => {
  const { setSelectedAgent, getChatData, agentArray } = useContext(ChatContext);
  const { idToken } = useContext(AuthContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;
    const data = getChatData();

    if (data.length > 0) {
      const openAgents = data.filter(
        (agent) => agent.is_open === true && agent.agent_model !== "AgentDebate"
      );

      // Set settings open if no open agents are found
      setSettingsOpen(openAgents.length === 0);

      // Set the selected agent to the first open agent
      const chatAgent = openAgents[0];
      if (chatAgent) setSelectedAgent(chatAgent);
    }

    setLoading(false);
  }, [idToken, setSelectedAgent]);

  useEffect(() => {});

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {settingsOpen && (
        <SettingsMenuContainer id="settings-container">
          <Settings id="settings">
            <AgentMenu />
          </Settings>
        </SettingsMenuContainer>
      )}
      <SettingsMenuButton
        disableRipple
        onClick={() => setSettingsOpen(!settingsOpen)}
      >
        {settingsOpen ? "Hide" : "Settings"}
      </SettingsMenuButton>
      {loading ? (
        <Box marginTop={30}>
          <CustomGridLoader />
        </Box>
      ) : (
        <>
          {agentArray
            .filter((agent) => agent.is_open)
            .map((agent) => {
              if (agent.agent_model === "AgentDebate") {
                return (
                  <Debate
                    key={agent.chatId}
                    id={agent.chatId}
                    chatName={agent.chat_name}
                    topic={agent.topic}
                  />
                );
              } else {
                return (
                  <Chat
                    key={agent.chatId}
                    chatId={agent.chatId}
                    chatConstants={agent.chat_constants}
                    systemPrompt={agent.system_prompt}
                    chatName={agent.chat_name}
                    agentModel={agent.agent_model}
                    useProfileData={agent.use_profile_data}
                  />
                );
              }
            })}
        </>
      )}
    </Box>
  );
};

export default memo(AgentDash);
