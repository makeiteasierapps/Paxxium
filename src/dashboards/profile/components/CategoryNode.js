import { useContext } from "react";
import { Typography, Box } from "@mui/material";
import { StyledCategoryNode } from "../styledProfileComponents";
import { ProfileContext } from "../../../contexts/ProfileContext";

// New component for the progress indicator
const ProgressIndicator = ({ answered, total }) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      height: "32px",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.1)",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: `${(answered / total) * 100}%`,
        background:
          "linear-gradient(90deg, rgba(0, 153, 255, 0.3) 0%, rgba(0, 153, 255, 0.6) 100%)",
        transition: "width 0.3s ease-in-out",
      }}
    />
    <Typography
      variant="caption"
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255, 255, 255, 0.7)",
        zIndex: 1,
      }}
    >
      {`${answered}/${total}`}
    </Typography>
  </Box>
);

const CategoryNode = ({ category, onClick }) => {
  const { activeCategory } = useContext(ProfileContext);
  const totalQuestions = category.questions ? category.questions.length : 0;
  const answeredQuestions = category.questions
    ? category.questions.filter((question) => question.answer).length
    : 0;

  return (
    <Box position="relative" sx={{ margin: "10px" }}>
      <StyledCategoryNode
        progress={answeredQuestions / totalQuestions}
        selected={activeCategory === category}
        onClick={() => onClick(category)}
      >
        <Typography
          sx={{
            fontWeight: 500,
            color: "white",
            lineHeight: 1.2,
            marginBottom: "8px",
            width: "100%",
            wordWrap: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {category.category}
        </Typography>

        <ProgressIndicator
          answered={answeredQuestions}
          total={totalQuestions}
        />
      </StyledCategoryNode>
    </Box>
  );
};

export default CategoryNode;
