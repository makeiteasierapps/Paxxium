import { useState, useContext } from "react";
import { Box, Typography, Card, InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReactCardFlip from "react-card-flip";
import { ProfileContext } from "../../../contexts/ProfileContext";
import { StyledIconButton } from "../../chat/chatStyledComponents";
import { CustomTextField } from "../styledProfileComponents";

const StyledCard = styled(Card)(({ theme }) => ({
  flex: "1 1 calc(33.333% - 16px)",
  maxWidth: 350,
  minWidth: 200,
  height: 200,
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  cursor: "pointer",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    flex: "1 1 100%",
    height: 160,
    maxWidth: "100%",
  },
  [theme.breakpoints.down("md")]: {
    flex: "1 1 100%",
    height: 160,
    maxWidth: 500,
  },
}));

const QaNode = ({ questionData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [answer, setAnswer] = useState("");
  const { updateAnswer } = useContext(ProfileContext);

  const handleSaveAnswer = async () => {
    console.log("Before update:", questionData);
    await updateAnswer(questionData._id, answer);
    console.log("After update:", questionData);
    setAnswer("");
    setIsEditing(false);
  };


  const handleCancelEdit = () => {
    setIsEditing(false);
    setAnswer("");
  };

  const handleStartEditing = () => {
    setAnswer(questionData.answer);
    setIsEditing(true);
  };

  const hasAnswerChanged = questionData.answer !== answer;
  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      {/* Front of card */}
      <StyledCard
        onClick={() => setIsFlipped(true)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
        }}
      >
        {questionData.answer && (
          <CheckCircleIcon
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "success.main",
            }}
          />
        )}
        <Typography
          variant="h6"
          textAlign="center"
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {questionData.question}
        </Typography>
      </StyledCard>

      {/* Back of card */}
      <StyledCard onClick={() => setIsFlipped(false)}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 2,
          }}
        >
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              fontSize: "0.9rem",
              opacity: 0.8,
              marginBottom: 2,
            }}
          >
            {questionData.question}
          </Typography>
          {questionData.answer && !isEditing ? (
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                marginBottom: 2,
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleStartEditing();
              }}
            >
              {questionData.answer}
            </Typography>
          ) : (
            <CustomTextField
              sx={{ width: "100%" }}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StyledIconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        hasAnswerChanged
                          ? handleSaveAnswer()
                          : handleCancelEdit();
                      }}
                      disabled={isEditing && !answer}
                    >
                      {hasAnswerChanged ? <SendIcon /> : <CloseIcon />}
                    </StyledIconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>
      </StyledCard>
    </ReactCardFlip>
  );
};

export default QaNode;
