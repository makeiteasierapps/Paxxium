import { useCallback, useState, useEffect } from "react";

export const useQuestionsManager = (backendUrl, uid, showSnackbar) => {
  const [questionsData, setQuestionsData] = useState([]);
  const [activeCategory, setActiveCategory] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionsFormOpen, setIsQuestionsFormOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const updateAnswer = async (questionId, answer) => {
    try {
      const response = await fetch(`${backendUrl}/profile/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          uid: uid,
          dbName: process.env.REACT_APP_DB_NAME,
        },
        body: JSON.stringify({ questionId, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to update answers");
      }

      setQuestionsData((prev) => {
        const updated = prev.map((category) => ({
          ...category,
          questions: category.questions.map((question) =>
            question._id === questionId ? { ...question, answer } : question
          ),
        }));

        const updatedActiveCategory = updated.find(
          (category) => category._id === activeCategory?._id
        );
        if (updatedActiveCategory) {
          setActiveCategory(updatedActiveCategory);
        }

        localStorage.setItem("questionsData", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      showSnackbar(`Network or fetch error: ${error.message}`, "error");
      console.error(error);
    }
  };

  const generateBaseQuestions = async (userInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/profile/generate_questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          uid: uid,
          dbName: process.env.REACT_APP_DB_NAME,
        },
        body: JSON.stringify({ userInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate follow-up questions");
      }

      setIsQuestionsFormOpen(false);
      setIsGraphOpen(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            const result = JSON.parse(line);
            const categoryNode = {
              id: result._id,
              name: result.category,
              type: "category",
              children: result.questions.map((q) => ({
                id: q._id,
                name: q.question,
                type: "question",
                answer: q.answer || null,
              })),
            };
          }
        }
      }

      localStorage.setItem("questionsData", JSON.stringify(questionsData));
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      showSnackbar(
        `Error generating follow-up questions: ${error.message}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getQuestions = useCallback(async () => {
    try {
      let data;
      const cachedQuestions = localStorage.getItem("questionsData");

      if (cachedQuestions) {
        data = JSON.parse(cachedQuestions);
      } else {
        const response = await fetch(`${backendUrl}/profile/questions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            uid: uid,
            dbName: process.env.REACT_APP_DB_NAME,
          },
        });
        data = await response.json();
        localStorage.setItem("questionsData", JSON.stringify(data));
      }
      setQuestionsData(data);
      setIsGraphOpen(data.length > 0);
      setIsQuestionsFormOpen(data.length === 0);
    } catch (error) {
      showSnackbar(`Network or fetch error: ${error.message}`, "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, showSnackbar, uid]);

  useEffect(() => {
    if (!uid) return;
    setIsLoading(true);
    getQuestions();
  }, [getQuestions, uid]);

  return {
    updateAnswer,
    questionsData,
    setActiveCategory,
    activeCategory,
    activeQuestion,
    setActiveQuestion,
    generateBaseQuestions,
    isLoading,
    isQuestionsFormOpen,
    isGraphOpen,
  };
};
