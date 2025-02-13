import { useEffect } from "react";

export const useInsightQuestionData = ({ uid, showSnackbar, socket }) => {
    const handleUpdatedQuestionData = (data) => {
        return data;
    };
    useEffect(() => {
        if (!socket) return;

        socket.on('insight_question_data', handleUpdatedQuestionData);

        return () => {
            socket.off('insight_question_data', handleUpdatedQuestionData);
        };
    }, [socket]);
};