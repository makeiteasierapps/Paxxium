import { useContext } from "react";
import { Box } from "@mui/material";
import CategoryNode from "./CategoryNode";
import QaNode from "./QaNode";
import QuestionNode from "./QuestionNode";
import { ProfileContext } from "../../../contexts/ProfileContext";

const GraphComponent = () => {
  const {
    questionsData,
    setActiveCategory,
    activeCategory,
    setActiveQuestion,
    activeQuestion,
  } = useContext(ProfileContext);

  const handleQuestionClick = (question) => {
    setActiveCategory(null);
    setActiveQuestion(question);
  };

  console.log(questionsData);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "90vh",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "1.5rem",
          overflowX: "auto",
          padding: "0.5rem",
          // Improve scroll behavior
          scrollBehavior: "smooth",
          // Hide scrollbar but keep functionality
          msOverflowStyle: "none", // IE and Edge
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            // Chrome, Safari, newer versions of Opera
            display: "none",
          },
          // Add padding to account for overflow shadows
          paddingBottom: "1rem",
        }}
      >
        {questionsData &&
          questionsData.length > 0 &&
          questionsData.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              onClick={() => setActiveCategory(category)}
              isActive={activeCategory?.id === category.id}
              sx={{ flexShrink: 0 }} // Prevent categories from shrinking
            />
          ))}
      </Box>

      {activeCategory && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: "1rem",
            flex: 1, // Take remaining space
          }}
        >
          {activeCategory.questions?.map((question) => (
            <QuestionNode
              key={question.id}
              questionData={question}
              onClick={handleQuestionClick}
            />
          ))}
        </Box>
      )}
      {activeQuestion && <QaNode questionData={activeQuestion} />}
    </Box>
  );
};

export default GraphComponent;
