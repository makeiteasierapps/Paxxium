import { Icon } from "@iconify/react";
import { Avatar, ListItemIcon, Box } from "@mui/material";
import { useState } from "react";
import { MessageContainer, MessageContent, StyledHeader, StyledCheckbox } from "../../agentStyledComponents";

const AgentMessage = ({ message }) => {
    const [checked, setChecked] = useState(false);
    return (
        <MessageContainer >
            <StyledHeader>
                <ListItemIcon>
                    <Avatar
                        sx={{
                            bgcolor: "secondary.main",
                            width: "33px",
                            height: "39px",
                        }}
                    >
                        <Icon icon="mdi:robot" style={{ fontSize: "30px" }} />
                    </Avatar>
                </ListItemIcon>
                <StyledCheckbox
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    inputProps={{ "aris-label": "Select message" }}
                />
            </StyledHeader>
            <MessageContent>
                {message.map((msg, index) => {
                    if (msg.type === "text") {
                        return <Box key={`text${index}`}>{msg.content}</Box>;
                    } else if (msg.type === "code") {
                        return (
                            <pre
                                key={`code${index}`}
                                className={`language-${msg.language}`}
                            >
                                <code
                                    dangerouslySetInnerHTML={{
                                        __html: msg.content,
                                    }}
                                />
                            </pre>
                        );
                    }
                    return null;
                })}
            </MessageContent>
        </MessageContainer>
    );
};

export default AgentMessage;
