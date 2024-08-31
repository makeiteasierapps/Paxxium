import { useCallback, useState, useEffect } from 'react';

export const useQuestionsManager = (backendUrl, uid, showSnackbar) => {
    const [treeData, setTreeData] = useState({
        id: 'root',
        name: 'Root',
        type: 'root',
        children: [],
    });
    const [activeNodeId, setActiveNodeId] = useState('root');
    const [expandedNodes, setExpandedNodes] = useState(['root']);

    const [isLoading, setIsLoading] = useState(true);
    const [isQuestionsFormOpen, setIsQuestionsFormOpen] = useState(false);
    const [isGraphOpen, setIsGraphOpen] = useState(false);

    const addNode = useCallback((parentId, newNode) => {
        setTreeData((prevTree) => {
            const updatedTree = { ...prevTree };
            const addNodeRecursive = (node) => {
                if (node.id === parentId) {
                    node.children = [...(node.children || []), newNode];
                    return true;
                }
                return node.children?.some(addNodeRecursive) || false;
            };
            addNodeRecursive(updatedTree);
            return updatedTree;
        });
    }, []);

    const updateAnswer = async (questionId, answer) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ questionId, answer }),
            });

            if (!response.ok) {
                throw new Error('Failed to update answers');
            }

            setTreeData((prevTreeData) => {
                const updatedTreeData = { ...prevTreeData };
                let parentCategoryId = null;

                const updateNodeRecursive = (node) => {
                    if (node.id === questionId) {
                        node.answer = answer;
                        return true;
                    }
                    if (node.children?.some(updateNodeRecursive)) {
                        parentCategoryId = node.id;
                        return true;
                    }
                    return false;
                };
                updateNodeRecursive(updatedTreeData);

                // Update expandedNodes
                if (parentCategoryId) {
                    setExpandedNodes((prev) =>
                        prev.includes(parentCategoryId)
                            ? prev
                            : [...prev, parentCategoryId]
                    );
                }

                // Prepare the data structure for local storage
                const dataToSave = updatedTreeData.children.map((category) => ({
                    _id: category.id,
                    category: category.name,
                    questions: category.children.map((question) => ({
                        _id: question.id,
                        question: question.name,
                        answer: question.answer,
                    })),
                }));

                // Save the correct structure to local storage
                localStorage.setItem(
                    'questionsData',
                    JSON.stringify(dataToSave)
                );

                return updatedTreeData;
            });
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    };

    const generateBaseQuestions = async (userInput) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendUrl}/profile/generate_questions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({ userInput }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate follow-up questions');
            }

            setIsQuestionsFormOpen(false);
            setIsGraphOpen(true);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        const result = JSON.parse(line);
                        const categoryNode = {
                            id: result._id,
                            name: result.category,
                            type: 'category',
                            children: result.questions.map((q) => ({
                                id: q._id,
                                name: q.question,
                                type: 'question',
                                answer: q.answer || null,
                            })),
                        };
                        addNode('root', categoryNode);
                    }
                }
            }

            localStorage.setItem('questionsData', JSON.stringify(treeData));
        } catch (error) {
            console.error('Error generating follow-up questions:', error);
            showSnackbar(
                `Error generating follow-up questions: ${error.message}`,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const getQuestions = useCallback(async () => {
        try {
            let data;
            const cachedQuestions = localStorage.getItem('questionsData');

            if (cachedQuestions) {
                console.log('using cached questions');
                data = JSON.parse(cachedQuestions);
                console.log('data', data);
            } else {
                console.log('fetching questions');
                const response = await fetch(
                    `${backendUrl}/profile/questions`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            uid: uid,
                            dbName: process.env.REACT_APP_DB_NAME,
                        },
                    }
                );
                data = await response.json();
                localStorage.setItem('questionsData', JSON.stringify(data));
            }

            setTreeData((prevTreeData) => {
                const newTreeData = {
                    ...prevTreeData,
                    children: data.map((category) => ({
                        id: category._id,
                        name: category.category,
                        type: 'category',
                        children: category.questions.map((q) => ({
                            id: q._id,
                            name: q.question,
                            type: 'question',
                            answer: q.answer || null,
                        })),
                    })),
                };
                setIsQuestionsFormOpen(newTreeData.children.length === 0);
                setIsGraphOpen(newTreeData.children.length > 0);
                return newTreeData;
            });
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
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
        treeData,
        updateAnswer,
        generateBaseQuestions,
        isLoading,
        isQuestionsFormOpen,
        isGraphOpen,
        activeNodeId,
        setActiveNodeId,
        expandedNodes,
        setExpandedNodes,
    };
};
