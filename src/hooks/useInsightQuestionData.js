import { useEffect } from "react";

export const useInsightQuestionData = ({ uid, showSnackbar, socket, backendUrl, onQuestionDataUpdate }) => {
    const handleUpdatedQuestionData = (data) => {
        return data;
    };

    const updateAnswer = async (category, answerObject) => {
        onQuestionDataUpdate(category, answerObject);
        console.log(answerObject);
        try {
            const response = await fetch(`${backendUrl}/insight/update_answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                },
                body: JSON.stringify({ category, subcategory: answerObject.subCategory, answer: answerObject.answer, index: answerObject.index }),
            });
            const data = await response.json();
            console.log('data', data);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };
    useEffect(() => {
        if (!socket) return;

        socket.on('insight_question_data', handleUpdatedQuestionData);

        return () => {
            socket.off('insight_question_data', handleUpdatedQuestionData);
        };
    }, [socket]);

    return { updateAnswer };
};
