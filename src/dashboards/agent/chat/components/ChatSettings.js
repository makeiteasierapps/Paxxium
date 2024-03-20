import {
  Button,
  FormControlLabel,
  MenuItem,
  TextField,
  Grid,
  Typography,
  IconButton,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useContext, useState } from "react";
import { ChatContext } from "../ChatContext";
import { SettingsMenuContainer } from "../../agentStyledComponents";

const settingsMenuVariants = {
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7 },
    transformOrigin: "top right",
  },
  hidden: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.7 },
    transformOrigin: "top right",
  },
};

const ChatSettings = ({
  chatId = "",
  setIsSettingsOpen,
  chatConstants: initialChatConstants = "",
  systemPrompt: initialSystemPrompt = "",
  chatName: initialChatName = "",
  agentModel: initialAgentModel = "",
  useProfileData: initialUseProfileData = false,
}) => {
  const { createChat, updateSettings, agentArray, loadChat } =
    useContext(ChatContext);

  const [agentModel, setAgentModel] = useState(initialAgentModel);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [chatConstants, setChatConstants] = useState(initialChatConstants);
  const [useProfileData, setUseProfileData] = useState(initialUseProfileData);
  const [chatName, setChatName] = useState(initialChatName);

  const [errors, setErrors] = useState({
    selectModel: "",
    name: "",
  });

  const handleLoadChat = async (event) => {
    const chatId = event.target.value;
    loadChat(chatId);
    setIsSettingsOpen(false);
  };

  const handleSubmit = () => {
    if (validate()) {
      createChat(
        agentModel,
        systemPrompt,
        chatConstants,
        useProfileData,
        chatName
      );
    }
  };

  const handleUpdateSettings = () => {
    const newAgentSettings = {
      chatId: chatId,
      agent_model: agentModel,
      system_prompt: systemPrompt,
      chat_constants: chatConstants,
      use_profile_data: useProfileData,
      chat_name: chatName,
    };
    updateSettings(newAgentSettings);
  };

  const validate = () => {
    let tempErrors = {};
    tempErrors.selectModel = agentModel ? "" : "This field is required.";
    tempErrors.name = chatName ? "" : "This field is required.";
    setErrors({
      ...tempErrors,
    });

    return Object.values(tempErrors).every((x) => x === "");
  };

  return (
    <SettingsMenuContainer
      id="settings-container"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={settingsMenuVariants}
    >
      <Grid container spacing={2} direction="column" padding={2}>
        <Grid
          item
          xs={12}
          container
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <IconButton
            aria-label="close"
            onClick={() => setIsSettingsOpen(false)}
            sx={{ padding: 0 }}
          >
            <CloseIcon />
          </IconButton>
          <TextField
            select
            id="loadChat"
            name="loadChat"
            value=""
            label="Load"
            variant="outlined"
            onChange={handleLoadChat}
            style={{ width: "15%" }}
          >
            {agentArray.map((agent) => {
              return (
                <MenuItem key={agent.chatId} value={agent.chatId}>
                  {agent.chat_name}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <TextField
            error={errors.selectModel ? true : false}
            helperText={errors.selectModel}
            required
            select
            id="selectModel"
            name="selectModel"
            label="Select Model"
            variant="outlined"
            value={agentModel}
            onChange={(event) => setAgentModel(event.target.value)}
            sx={{ width: "28%" }}
          >
            <MenuItem value="GPT-3.5">GPT 3.5</MenuItem>
            <MenuItem value="GPT-4">GPT 4</MenuItem>
          </TextField>
        </Grid>

        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <TextField
            error={errors.selectModel ? true : false}
            helperText={errors.selectModel}
            required
            id="name"
            name="name"
            label="Name"
            variant="outlined"
            value={chatName}
            onChange={(event) => setChatName(event.target.value)}
            inputProps={{ style: { textAlign: "center" } }}
          />
        </Grid>

        <Grid item container spacing={2} xs={12}>
          <Grid item xs={6}>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              align="center"
            >
              Personality/Role
            </Typography>

            <TextField
              id="systemPrompt"
              name="systemPrompt"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              align="center"
            >
              Things to Remember
            </Typography>

            <TextField
              id="chatConstants"
              name="chatConstants"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={chatConstants}
              onChange={(event) => setChatConstants(event.target.value)}
            />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <FormControlLabel
            control={
              <Switch
                color="secondary"
                name="useProfileData"
                checked={useProfileData}
                onChange={(event) => setUseProfileData(event.target.checked)}
                size="large"
              />
            }
            label="AI Insight"
          />
        </Grid>

        <Grid item container spacing={2} xs={12}>
          <Grid item xs={6}>
            <Button
              id="createButton"
              name="createButton"
              fullWidth
              variant="contained"
              onClick={handleSubmit}
            >
              Create
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              id="updateButton"
              name="updateButton"
              fullWidth
              variant="contained"
              onClick={handleUpdateSettings}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </SettingsMenuContainer>
  );
};

export default ChatSettings;
